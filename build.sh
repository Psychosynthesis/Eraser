#!/bin/bash
cd ./src/firefox && zip -r ../../build/eraser_firefox.xpi *
cd ../chrome && zip -r ../../build/eraser_chrome.zip *
