/*
 *  Amber Notes
 *
 *  Copyright (C) 2016 - 2019 The Amber Notes Authors
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

import { AggregateRoot } from "infrastructure-model";

export default class EncryptedAggregate extends AggregateRoot {

  constructor(id, createdOn, modifiedOn, deleted, nonce) {
    super(id, createdOn, modifiedOn, deleted);
    if (new.target === EncryptedAggregate) {
      throw new Error("Can't construct abstract instances directly");
    }
    this._nonce = nonce;
    if (!this._nonce) {
      throw new Error("Nonce is null");
    }
  }

  get nonce() {
    return this._nonce;
  }

  toJSON() {
    var json = super.toJSON();
    json.nonce = this.nonce;
    return json;
  }

}