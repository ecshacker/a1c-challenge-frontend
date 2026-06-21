# Testing the User Interface and User Experience

See the Environment Bring-Up section below to setup and launch your own environment, or use https://a1c-challenge.org which is deployed from the master branch on GitHub.

If running locally your endpoint will be https://localhost:3000.

Recommended to use web browser's Incognito mode to easily test or switch back to having no profile.

There is a /testpad URI path that presents a button to examine and interact with each view that has been built.

The home / URI is the landing that all will see - the normal visitor flow.

The web UI uses styles in files global.css and lib/theme.ts. The 'MT' entry in theme.ts is where device viewing responsiveness (phone, tablet, laptop) responsiveness can be worked in to customize for smaller/larger or portrait/landscape viewports.

- **`/testpad`** — the React route-list lives here, for trying out designs and component or view testing
- **`/`** — landing page matching the app's full design system (Merriweather, bone/sage palette, same card/section pattern)


# Environment Bring-Up
***
## Pre-requisites

Git (GitHub)
Java (JDK) 17+
Python
Node.js
Apache Maven
A local PostgreSQL install or solution otherwise

***
### Git the code

Both repos live at :
- [https://github.com/ecshacker/a1c-challenge-frontend](https://github.com/ecshacker/a1c-challenge-frontend)
- [https://github.com/ecshacker/a1c-challenge-backend](https://github.com/ecshacker/a1c-challenge-backend)

- **backend** — `master` (root commit), 62 files, full Spring Boot app including Flyway migrations
- **frontend** — `master` (root commit), 27 files, all screens wired plus the shared token/API modules

Pull them down in the folder where you want them to run from.
```sh
mkdir a1c-challenge-frontend
cd a1c-challenge-frontend
git init
git pull https://github.com/ecshacker/a1c-challenge-frontend master
cd ..
```

First time?
```sh
sudo apt install -y nodejs
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v
npm -v
npm i -g create-next-app
```

If you had the prereqs you can just run this. Must be run from that frontend folder. **Also, run this each time you do a git pull if you are using 'npm start' or running as a production service.**
```sh
npm run build
```

```sh
mkdir a1c-challenge-backend
cd a1c-challenge-backend
git init
git pull https://github.com/ecshacker/a1c-challenge-backend master
```

If this is the first time you have pulled down the backend it is recommended to do a Maven compile to let it download a bunch of dependencies and catch whether or not you need to make two changes to pom.xml for the Java version you are on.
```sh
mvn -q compile
```

If you get errors about missing getter/setter methods it is an issue with Lombok and Java version 25. Java 25 requires Lombok to be wired as an annotation processor explicitly in the Maven compiler plugin, otherwise `@Getter`/`@Setter` methods are never generated and the compiler can't find them. For Java version 17, pom.xml needs java.properties set to 17 and everyone is happy. If Java recent version and it gets an error, set `java.version` to 21 (the current LTS, Java 25 compiles targeting 21 cleanly) and add an explicit `annotationProcessorPaths` entry for Lombok so the compiler plugin doesn't rely on auto-discovery. Your pom.xml needs to have the following:

```xml
<properties>  
    <java.version>21</java.version>  
</properties>
```

```xml
<plugins>  
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>  
        <artifactId>maven-compiler-plugin</artifactId>  
        <configuration>
            <annotationProcessorPaths>
                <path>
                    <groupId>org.projectlombok</groupId>  
                    <artifactId>lombok</artifactId>  
                    <version>${lombok.version}</version>  
                </path>
            </annotationProcessorPaths>
        </configuration>
    </plugin>
```

The work-around is to install OpenJDK 21 and set it to be where java and javac point.
```sh
sudo apt install openjdk-21-jdk -y
sudo update-alternatives --config java
```

Confirm that you have it set.
```sh
$ java --version
openjdk 21.0.11 2026-04-21
OpenJDK Runtime Environment (build 21.0.11+10-1-26.04.2-Ubuntu)
OpenJDK 64-Bit Server VM (build 21.0.11+10-1-26.04.2-Ubuntu, mixed mode, sharing)
```

Lastly, package the backend for production launching. This creates the .jar that will be used when running a live system. **Do this after each git pull.**
```sh
mvn package
```

***
### Start the backend

Open a Terminal and change directories to the backend project folder.

```sh
cd a1c-challenge-backend
```

Start the backend with the `local` profile active to use locally installed PostgreSQL:

```sh
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Or if you're using an IDE, set the active profile to `local` in the run configuration. Spring will merge `application.yaml` + `application-local.yml` — Flyway runs V1 and V2, schema is created, and the app comes up on port 8080.

After it starts, flip the study status so enrollment works whenever ready to test that UI flow:

```sql
UPDATE study_config SET status = 'OPEN' WHERE id = 1;
```

Run that in psql or pgAdmin against `a1c_challenge`. Once that's done, the full flow from enrollment through milestone is live.

NOTE: It is untested whether a frontend restart is needed after changing study_config. Until tested, the frontend should be started/restarted after changing study_config.

***
### Start the frontend

Open a Terminal and change directories to the frontend project folder.
```sh
cd a1c-challenge-frontend
```

Start (or restart) the frontend.
```sh
npm run dev
```

```sh
npm run build
npm start
```

The rewrite proxies all `/api/v1/*` calls through Next.js to `localhost:8080` — no CORS headers needed. Once `study_config` is `OPEN`, hit `localhost:3000/enrollment` and the full flow should be live end-to-end.

That will leave a web browser listener running on port 3000 by default that allows you to interact with your React/Next.js app.

***
### Smoke test

Quick smoke test worth doing before anything else — hit the enrollment flow at `localhost:3000/enrollment` and enroll a test participant. That exercises the most critical path: `POST /participants/enroll`, the Schrödinger token reveal, `persistToken()` on confirm, then the redirect to `/day-one`.

If enrollment goes through, the rest of the wiring (check-in, milestone) follows the same token pattern so it should hold. Let me know what you hit — or if there's a specific screen or behavior you want to work on next.

***
### Deployment

The above was for a development or testing environment.  **For a live deploy**, the typical flow once GitHub is set up on your target server:

- Next.js: `npm run build` → `npm start` (or export static if you go that route) behind Nginx as a reverse proxy on port 3000
- Spring Boot: `mvn package` → run the jar, Nginx proxies `/api/v1/*` to port 8080
- On the EC2 side, a simple deploy script does `git pull && npm run build && pm2 restart` (or `systemctl restart`) — keeps it in sync with a single command


