#!/bin/sh

git fetch origin

STAGE="${STAGE:=master}"
echo $STAGE
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo $BRANCH
if [ $STAGE != $BRANCH ] ; then
    echo "branch aren't the same checkout to stage"
    git checkout $STAGE
fi
reslog=$(git log HEAD..origin/$STAGE --oneline)
if [[ "${reslog}" != "" ]] ; then
    git pull
    wp cron event schedule plugins_loaded --allow-root
fi