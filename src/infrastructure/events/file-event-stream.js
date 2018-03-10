/*
 *  Amber Notes
 *
 *  Copyright (C) 2016 - 2018 The Amber Notes Authors
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import * as os from "os";
import * as path from "path";
import { directoryExists, createDirectory, fileExists, readFile, writeFile } from "infrastructure-util";
import Event from "./event";
import EventStream from "./event-stream";

export default class FileEventStream extends EventStream {

  constructor(props) {
    super(props);
    this._events = [];
    if (props && "events" in props) {
      this._events = props.events;
    }
    this._path = null;
    if (props && "path" in props) {
      this._path = props.path;
    }
  }

  get length() {
    return this._events.length;
  }

  get path() {
    return this._path;
  }

  set path(value) {
    this._path = value;
  }

  async open() {
    await super.open();
    var pathToFile = this.getPathToStream();
    if (await fileExists(pathToFile)) {
      var content = await readFile(pathToFile, { flag: "r", encoding: "utf8" });
      if (content) {
        var lines = content.split(/\r?\n/);
        if (lines) {
          for(var line of lines) {
            var props = JSON.parse(line);
            if ("name" in props) {
              if (this.supportedEventTypes.has(props.name)) {
                var eventType = this.supportedEventTypes.get(props.name);
                var event = new eventType(props);
                this._events.push(event);
              } else {
                throw {
                  message: `Event '${props.name}' is not supported`
                };
              }
            } else {
              throw {
                message: "Event's name is missing"
              };
            }
          }
        }
      }
    }
  }

  async close() {
    await super.close();
    var pathToFile = this.getPathToStream();
    var pathToDirectory = path.dirname(pathToFile);
    if (!await directoryExists(pathToDirectory)) {
      await createDirectory(pathToDirectory);
    }
    var content = "";
    if (this._events) {
      var index = 0;
      for (var event of this._events) {
        if (index) {
          content += os.EOL;
        }
        content += JSON.stringify(event);
        index++;
      }
    }
    await writeFile(pathToFile, { flag: "w" , encoding: "utf8" }, content);
  }

  async read() {
    if (this.closed) {
      throw {
        message: "Stream is closed"
      };
    }
    var event = null;
    if (this._position >= 0 && this._position < this._events.length) {
      event = this._events[this._position++];
    }
    return event;
  }

  async write(event) {
    if (!event) {
      throw {
        message: "Event is null"
      };
    }
    if (!(event instanceof Event)) {
      throw {
        message: "Type of event is invalid"
      };
    }
    if (!event.name) {
      throw {
        message: "Event's name is not set"
      };
    }
    if (!this.supportedEventTypes.has(event.name)) {
      throw {
        message: `Event '${event.name}' is not supported`
      };
    }
    if (this.closed) {
      throw {
        message: "Stream is closed"
      };
    }
    this._events.push(event);
  }

  getPathToStream() {
    if (this.path) {
      return path.resolve(this.path, this.name);
    }
    return this.name;
  }

  toJSON() {
    return {
      name: this.name,
      path: this.getPathToStream()
    };
  }

  [Symbol.iterator]() {
    return {
      next: () => ({
        value: this._events[this._position++],
        done: this._position < 0 || this._position > this._events.length
      })
    };
  }
}