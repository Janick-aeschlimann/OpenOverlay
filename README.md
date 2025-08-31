# OpenOverlay

**OpenOverlay** is a powerful open-source web application for creating and managing customizable overlays, primarily designed for live streams and live productions.

The key feature is **real-time collaboration**: multiple users can edit the same overlay simultaneously in the browser and instantly see each other’s changes. All updates made in the editor are automatically reflected live in the overlay, ensuring smooth and immediate control during a broadcast.

Streamers and teams can quickly respond to live events — for example, launching polls, temporarily hiding sensitive or unwanted content, adding fun or informative graphics, or toggling visibility of donation alerts — all with just a few clicks.

OpenOverlay is fully **open-source** and can be **self-hosted**, giving you complete freedom and control over your streaming setup.

You can try it out here: [Demo](https://demo.open-overlay.dafric.net/)

✨ Features
---
- **Overlays**: Create Overlays and display informations for your livestream / live production
- **Live Editable Overlays**: Create Overlays and when you make changes in the editor, they are displayed in the overlay in realtime
- **In-Browser Overlay Editor**: Edit Overlays in a modern, easy to use visual editor in the browser
- **Real-Time Collaboration**: Edit Overlays together in real time, you see the changes other people make in real time
- **Live Overlay switch**: Switch between multiple Overlays on the go.
- **Workspace / User Management**: Manage your own Workspace, invite members to collaborate, create Overlays and manage members of the workspace.

**more coming soon...**


🏡 Self-Hosting Guide (Linux)
---
### Install Docker Compose
On your Server follow this guides to install docker engine and docker compose.
- [Install Docker Engine](https://docs.docker.com/engine/install/)
- [Install Docker Compose Plugin](https://docs.docker.com/compose/install/linux/)

### Clone Git-Repository
Clone this Repository to your server:
```bash
git clone https://github.com/Janick-aeschlimann/OpenOverlay.git
```

### Configure Environment Files
To configure the application for your needs, you can change the values in the env templates to your needs.

To Get Your Project up and running you have to copy following templates to the given paths in your cloned git repository. Then you can configure the values to your needs.

#### ⚙️ /y-redis/.env
[Env-Template](https://github.com/Janick-aeschlimann/OpenOverlay/blob/main/y-redis/.env.template)

#### ⚙️ /backend/.env
```env
# Backend Port
PORT=7001

API_URL=http://localhost:7001
FRONTEND_URL=https://localhost:7000

# Database
DB_HOST="db"
DB_PORT="3306"
DB_USER="dev"
DB_PASSWORD="password"
DB_DATABASE="open_overlay"
TZ="UTC"

# SuperTokens
SUPERTOKENS_URL="http://localhost:3567"


#Supertokens DB Setup
MYSQL_ROOT_PASSWORD="password"
MYSQL_USER="dev"
MYSQL_PASSWORD="password"
MYSQL_DATABASE="supertokens"

MYSQL_CONNECTION_URI="mysql://dev:password@db:3306/supertokens"
```

#### ⚙️ /frontend/.env
```env
VITE_API_URL=http://localhost:7001
VITE_WS_URL=ws://localhost:7002
```

### Configure Docker Compose Ports
In docker-compose.yaml file configure the port-mapping to your needs.

### Start the Server
Run ```docker compose up -d``` to run start the server.

### Stop the Server
Run ```docker compose down``` to stop the server.

🧰 Tech-Stack
---
### Backend

- nodejs
- expressjs
- mysql
- SuperTokens (auth)
- y-redis (custom implementation)

### Frontend

- React
- Shadcn UI
- tailwindcss
- Yjs

📖 How To Use?
---
Coming soon...
