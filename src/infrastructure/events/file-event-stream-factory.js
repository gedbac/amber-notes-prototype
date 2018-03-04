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

import EventStreamFactory from "./event-stream-factory";
import FileEventStream from "./file-event-stream";

export default class FileEventStreamFactory extends EventStreamFactory {

  constructor(props) {
    super(props);
    this._path = null;
    if ("path" in props) {
      this._path = props.path;
    }
  }

  get path() {
    return this._path;
  }

  set path(value) {
    this._path = value;
  }

  create(name) {
    if (!name) {
      throw {
        message: "Stream name is null"
      };
    }
    return new FileEventStream({
      name: name,
      path: this.path,
      supportedEventTypes: this.supportedEventTypes
    });
  }

}