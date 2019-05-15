#!/bin/bash
#
# Note: This script is NOT intended to be run in your checkout directory. It is only run on the Travis CI
# system (ephemeral instances) to push to the gh-pages branch. Use build.sh instead.

#git config --global user.email "lacava@upenn.edu"
#git config --global user.name "William La Cava"
git remote add deploy "https://$GH_TOKEN@github.com/$GH_USER/$GH_REPO.git"
git fetch deploy
git reset -q deploy/gh-pages

# Cherrypicked checkout from master
git checkout master docs/Makefile docs/source
git reset -q HEAD

# Build with Sphinx (HTML)
cd docs
make -C docs/ html BUILDDIR=.

# No longer need sources
rm -rf Makefile source

# # Add additionl artifacts to /download (if produced)
# mkdir -p download
# [ -d build/html ] && mv -f build/html/* ./
# find build -name *.epub -exec cp {} ./download/ \; -quit
# find build -name *.epub -exec cp {} ./download/book.epub \; -quit
# find build -name *.pdf -exec cp {} ./download/ \; -quit
# find build -name *.pdf -exec cp {} ./download/book.pdf \; -quit
touch .nojekyll
git log master -5 > COMMITS.txt
git add -A >& /dev/null
git commit -m "Generated gh-pages for `git log master -1 --pretty=short --abbrev-commit`" && git push deploy HEAD:gh-pages
