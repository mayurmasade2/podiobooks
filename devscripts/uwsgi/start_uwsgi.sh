#!/usr/bin/env bash
uwsgi -s /tmp/uwsgi.sock -C -M -A 4 -m --pidfile /tmp/uwsgi.pid