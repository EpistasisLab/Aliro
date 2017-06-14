module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // lab application
    {
      name      : "lab",
      script    : "lab.js",
      env: {
        COMMON_VARIABLE: "true"
      },
      env_production : {
        NODE_ENV: "dev"
      },
      "args": [
       "--max_old_space_size=8192"
      ],
//      cwd : "/share/devel/Gp/lab",
//      ignore_watch : ["node_modules","log",".+\.sw."],
      watch: ['lab.js','api/preferences.js'],
 //     watch: ['lab.js'],
      ignore_watch : ["node_modules"],
    }

  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    dev : {
      user : "node",
      ref  : "origin/master",
      //host : "0.0.0.0",
      //repo : "git@github.com:repo.git",
      path : "/share/devel/Gp/lab",
      //"post-deploy" : "npm install && pm2 startOrRestart ecosystem.json --env dev",
      env  : {
        NODE_ENV: "dev"
      }
    }
  }
}
