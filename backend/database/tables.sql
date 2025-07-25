-- Active: 1748635777197@@184.174.36.51@3307@open_overlay
USE open_overlay;

CREATE TABLE user(
  userId VARCHAR(128) PRIMARY KEY,
  username VARCHAR(128) UNIQUE NOT NULL,
  created_at DATETIME NOT NULL,
  profile_picture VARCHAR(255)
)

CREATE TABLE `workspace` (
	`workspaceId` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`name` VARCHAR(255) NOT NULL,
	`slug` VARCHAR(255) NOT NULL UNIQUE,
	`logo` VARCHAR(255),
	`ownerId` VARCHAR(128) NOT NULL,
	PRIMARY KEY(`workspaceId`),
  FOREIGN KEY (`ownerId`) REFERENCES `user`(`userId`)
);

CREATE TABLE `workspace_role` (
	`roleId` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`workspaceId` INTEGER NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`roleId`),
  FOREIGN KEY(`workspaceId`) REFERENCES `workspace`(`workspaceId`) ON DELETE CASCADE
);


CREATE TABLE `role_permission` (
	`roleId` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`permission_key` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`roleId`, `permission_key`),
  FOREIGN KEY(`roleId`) REFERENCES `workspace_role`(`roleId`) ON DELETE CASCADE
);

CREATE TABLE `workspace_access` (
	`accessId` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`roleId` INTEGER NOT NULL,
	`userId` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`accessId`),
	Foreign Key (roleId) REFERENCES workspace_role(roleId),
	Foreign Key (userId) REFERENCES user(userId) ON DELETE CASCADE
);

CREATE TABLE `overlay` (
	`overlayId` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`name` VARCHAR(255) NOT NULL,
	`description` TEXT(65535),
	`workspaceId` INTEGER NOT NULL,
	`created_at` TIMESTAMP NOT NULL,
	`userId` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`overlayId`),
	Foreign Key (workspaceId) REFERENCES workspace(workspaceId) ON DELETE CASCADE,
	Foreign Key (userId) REFERENCES user(userId)
);

CREATE TABLE `renderSource` (
	`renderSourceId` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`name` VARCHAR(255) NOT NULL,
	`token` VARCHAR(255) NOT NULL,
	`overlayId` INTEGER,
	`workspaceId` INTEGER NOT NULL,
	`updated_at` DATETIME NOT NULL,
	`width` INTEGER NOT NULL,
	`height` INTEGER NOT NULL,
	`frameRate` INTEGER NOT NULL,
	PRIMARY KEY(`renderSourceId`),
	Foreign Key (overlayId) REFERENCES overlay(overlayId) ON DELETE SET NULL,
	Foreign Key (workspaceId) REFERENCES workspace(workspaceId) ON DELETE CASCADE
);

CREATE TABLE `workspace_invite` (
	`workspaceInviteId` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`workspaceId` INTEGER NOT NULL,
	`token` VARCHAR(255) NOT NULL,
	`created_by` VARCHAR(255) NOT NULL,
	`expires_at` DATETIME,
	`usages` INTEGER NOT NULL,
	`max_usages` INTEGER,
	`roleId` INTEGER NOT NULL,
	PRIMARY KEY(`workspaceInviteId`),
	Foreign Key (workspaceId) REFERENCES workspace(workspaceId) ON DELETE CASCADE,
	Foreign Key (created_by) REFERENCES user(userId),
	Foreign Key (roleId) REFERENCES workspace_role(roleId) ON DELETE CASCADE
);