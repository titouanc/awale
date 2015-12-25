# [Awalé](https://en.wikipedia.org/wiki/Oware)

Demo http://awale.ititou.be/.

You need nodejs to compile the frontend app, python to run the game server.

## Install

    git clone https://github.com/titouanc/awale.git
    virtualenv -p python3.4 ve3
    source ve3/bin/activate
    pip install -r requirements.txt
    make

## Run

    crossbar start &
    python app.py
