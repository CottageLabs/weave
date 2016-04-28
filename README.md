# Weave

Data publication/presentation platform and demo site

## Installation

Clone the project:

    git clone https://github.com/CottageLabs/weave.git

get all the submodules

    cd weave
    git submodule update --init -- recursive

Install esprit and magnificent octopus, and related dependencies

    pip install -r requirements.txt

Create your local config

    cd weave
    touch local.cfg

Then you can override any config values that you need to

Then, start your app with

    python service/web.py

You can visit the running application at:

    http://localhost:5029

## Loading the test data

For the demo intererfaces to function, you need to load the test data.  The following scripts can be run:

### UK Election data

    cd demo-edges/data/election
    sh load.sh
    

    