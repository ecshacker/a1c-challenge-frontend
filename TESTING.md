# Testing the User Interface and User Experience

See the Environment Bring-Up section below to setup and launch your own environment, or use https://a1c-challenge.org which is deployed from the master branch on GitHub.

If running locally your endpoint will be https://localhost:3000.

Recommended to use web browser's Incognito mode to easily test or switch back to having no profile.

There is a /testpad URI path that presents a button to examine and interact with each view that has been built.

The home / URI is the landing that all will see - the normal visitor flow.

The web UI uses styles in files global.css and lib/theme.ts. The 'MT' entry in theme.ts is where device viewing responsiveness (phone, tablet, laptop) responsiveness can be worked in to customize for smaller/larger or portrait/landscape viewports.

- **`/testpad`** — the React route-list lives here, for trying out designs and component or view testing
- **`/`** — landing page matching the app's full design system (Merriweather, bone/sage palette, same card/section pattern)
  
  

***

## Multi-week simulation test plan

### Enroll test

I'll set the study to be 'open'.

```sql
// week 1 is 6/29 (future, so unreachable)
update study_config set status = 'OPEN', launch_date = '2026-06-26';
```

We use an incognito browser window to access the study and enroll, set our start date, copy that token down with what start date it has. Close the window and reopen another (or however you wish to achieve having two tokens) to enroll another time, set start date, and copy down that second token. Now we each have two tokens to play with. Both tokens with start date set is good, at least one with start date set is necessary.

Tool around the UI for a final spot-check. Test that going to /check-in gives a friendly message that it isn't time yet. Test out reconnecting a token either now or on next test.

### Week 1 test

Then I'll put study launch date a week prior and restart the backend so that we can do a real check-in.

```sql
// week 1 is 6/22 (current week, so is reachable)
update study_config set launch_date = '2026-06-19';
// participant start date of 6/22 makes current week 1
update participants set start_date = '2026-06-22' where start_date = '2026-06-29';
```

We'll do a test of that check-in form and the UX. The /check-in form should now land the visitor on week 1 and allow editing of same. It should also allow editing (via the navigation bar) of "in", which is intake/enrollment data first seen on the /day-one view.

## Week 2 test

Then I'll put study launch date a week prior to that and restart the backend to simulate the student having been open for 2full weeks. Also, set the participants.start_date to be a week prior so our test tokens are now in week 2 relative to their individual start_date.

```sql
// week 1 is 6/15 (current week is 2)
update study_config set launch_date = '2026-06-12';
// participant start date of 6/15 makes current week 2
update participants set start_date = '2026-06-15' where start_date = '2026-06-22';
```

We'll test that check-in again. Now visiting /check-in should land the visitor on week 2 and the form should allow reaching week 1 and 2 for editing (our ) for editing.

Also, the "in" button on the navigation should still allow the start numbers to be editable. They lock to read-only starting week 3, allow the user to change intake numbers in their first 14 days max.

## Week 3 test

Then I'll put study launch date a week prior to that, to simulate it having been open for 3 full weeks. Also, set the participants.start_date to be a week prior so they are now in week 3.

```sql
// week 1 is 6/8 (current week is 3)
update study_config set launch_date = '2026-06-05';
// participant start date of 6/8 makes current week 3
update participants set start_date = '2026-06-08' where start_date = '2026-06-15';
```

We'll test that check-in again. Now visiting /check-in should land the visitor on week 3 and allow editing of same. The form should also allow reaching week 2 for editing. As the participant is now in week 3, and the "in" (intake numbers) form should be read-only and no longer editable. The "1" button is selectable to view but not edit week 1's entry *(<- verify this, it may be that "1" is just not clickable at all and that only "in", 2, and 3 are reachable, only 2 and 3 editable)*. Meaning, one can navigate between starting/intake numbers, week 1, week 2, and current week 3 - can edit only week 2 and 3.

## Week 4 test

Then I'll put study launch date a week prior to that, to simulate it having been open for 4 weeks.

```sql
// week 1 is 6/1 (current week is 4)
update study_config set launch_date = '2026-05-29';
// participant start date of 6/1 makes current week 4
update participants set start_date = '2026-06-01' where start_date = '2026-06-08';
```

We'll test that check-in again. Visiting /check-in lands on week 4, allows editing of week 3.

## Milestone test

Then I'll put study launch date a week prior to that, to simulate it having been open for 5 weeks.

```sql
// week 1 is 6/1 (current week is 4)
update study_config set launch_date = '2026-05-22';
// participant start date of 6/1 makes current week 4
update participants set start_date = '2026-05-25' where start_date = '2026-06-01';
```

Week 4 is editable and a new button to enter Milestone numbers shows up when the user locks week 4.

### Analysis/Reset

Put the study back to pre-launch state and restart the backend.

```sql
    update study_config set status = 'PRE_LAUNCH', lauch_date = null;
```

Analyze the UX feedback and data collected to the participants, checkins, and milestones tables.

Eliminate the data for a fresh round of testing or go-live.

```sql
    delete from milestones;
    delete from checkins;
    delete from draft_checkins;
    delete from participants;
```

****

# Environment Bring-Up

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
