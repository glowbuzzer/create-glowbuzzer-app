# create-glowbuzzer-app

This is a simple npm module to scaffold a new Glowbuzzer React app using Vite.

The module performs the following steps when run:

1. Prompts for your app name
2. Creates a new directory with the name of the app
3. Uses `degit` to copy files from glowbuzzer/gbr/template on Github
4. Post-processes the files to update dependencies

Once the new app is created, you can run it with:

```bash
cd <app-name>
npm install
npm start
```