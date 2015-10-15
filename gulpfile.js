// Modified from https://github.com/gulpjs/gulp/blob/master/docs/recipes/automate-release-workflow.md

var fs = require("fs");
var parseArgs = require("minimist");
var gulp = require("gulp");
var runSequence = require("run-sequence");
var gutil = require("gulp-util");
var git = require("gulp-git");
var bump = require("gulp-bump");
var conventionalChangelog = require("gulp-conventional-changelog");
var conventionalGithubReleaser = require("conventional-github-releaser");
var conventionalRecommendedBump = require("conventional-recommended-bump");

// Load CONVENTIONAL_GITHUB_RELEASER_TOKEN from .env
require("dotenv").config({silent: true});
var options = parseArgs(process.argv.slice(2), {string: ["github_token"], default: {github_token: process.env.CONVENTIONAL_GITHUB_RELEASER_TOKEN}});

// Changelogs use AngularJS convention (https://github.com/ajoslin/conventional-changelog/blob/master/conventions/angular.md)
gulp.task("changelog", function() {
  return gulp.src("CHANGELOG.md", {buffer: false})
  .pipe(conventionalChangelog({preset: "angular"}))
  .pipe(gulp.dest("./"));
});

gulp.task("github-release", function(cb) {
  conventionalGithubReleaser({type: "oauth", token: options.github_token}, {preset: "angular"}, cb);
});

// Abides by semantic versioning rules (http://semver.org/)
gulp.task("bump-version", function() {
  // Valid bump types are major|minor|patch|prerelease
  conventionalRecommendedBump({preset: "angular"}, function(err, releaseAs) {
    return gulp.src(["./bower.json", "./package.json"])
    .pipe(bump({type: releaseAs}).on("error", gutil.log))
    .pipe(gulp.dest("./"));   
  });
});

gulp.task("commit-changes", function() {
  return gulp.src(".")
  .pipe(git.add())
  .pipe(git.commit("chore: bump version number [ci skip]"));
});

gulp.task("push-changes", function(cb) {
  git.push("origin", "master", cb);
});

gulp.task("create-new-tag", function(cb) {
  // Parses the JSON file instead of using require as require caches multiple calls so the version number won't be updated
  var getPackageJsonVersion = function() {
    return JSON.parse(fs.readFileSync("./package.json", "utf8")).version;
  };

  var version = getPackageJsonVersion();
  git.tag(version, "Created tag for version: " + version, function(err) {
    if (err) {
      return cb(err);
    }
    git.push("origin", "master", {args: "--tags"}, cb);
  });
});

gulp.task("release", function(cb) {
  runSequence("bump-version", "changelog", "commit-changes", "push-changes", "create-new-tag", "github-release", function(err) {
    if (err) {
      console.log(err.message);
    } else {
      console.log("RELEASE FINISHED SUCCESSFULLY");
    }
    cb(err);
  });
});

// Default task
gulp.task("default", function() {});
