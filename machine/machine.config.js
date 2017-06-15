module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // machine application
    {
      name      : "machine",
      script    : "machine.js",
      env: {
        COMMON_VARIABLE: "true"
      },
      env_production : {
        NODE_ENV: "dev"
      },
//      cwd : "/share/devel/Gp/machine",
//      ignore_watch : ["node_modules","log",".+\.sw."],
      watch: ['machine.js','datasets.js'],
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
      path : "/share/devel/Gp/machine",
      //"post-deploy" : "npm install && pm2 startOrRestart ecosystem.json --env dev",
      env  : {
        NODE_ENV: "dev"
      }
    }
  }
}
