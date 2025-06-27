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
    FOREIGN KEY(`workspaceId`) REFERENCES `workspace`(`workspaceId`)
);


CREATE TABLE `role_permission` (
	`roleId` INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
	`permission_key` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`roleId`, `permission_key`),
    FOREIGN KEY(`roleId`) REFERENCES `workspace_role`(`roleId`)
);