/**
 * This file is a part of MediaCore, Copyright 2010 Simple Station Inc.
 *
 * MediaCore is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MediaCore is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

goog.provide('mcore.players.MultiPlayer');

goog.require('goog.array');
goog.require('goog.ui.Component');
goog.require('mcore.players.EventType');



/**
 * A component for rendering each of the given players until one works.
 *
 * @param {Array.<goog.ui.Component>} players Player component instances.
 * @param {goog.dom.DomHelper=} opt_domHelper An optional DomHelper.
 * @constructor
 * @extends {goog.ui.Component}
 */
mcore.players.MultiPlayer = function(players, opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * Player UI Components.
   * @type {Array.<goog.ui.Component>}
   * @protected
   */
  this.players = players;
};
goog.inherits(mcore.players.MultiPlayer, goog.ui.Component);


/**
 * Index of the currently rendered/decorated sub-player.
 * Corresponds to {@code this.players} and is potentially out of bounds.
 * @type {number}
 * @protected
 */
mcore.players.MultiPlayer.prototype.currentPlayer = -1;


/**
 * Begin working through the available players.
 * @inheritDoc
 */
mcore.players.MultiPlayer.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.rotatePlayer();
};


/**
 * Swallow the event and rotate the player when an error event is thrown.
 * @param {goog.events.Event} e
 * @protected
 */
mcore.players.MultiPlayer.prototype.handleErrorEvent = function(e) {
  e.stopPropagation();
  this.rotatePlayer();
};


/**
 * Try the next available player after disposing of the last one.
 */
mcore.players.MultiPlayer.prototype.rotatePlayer = function() {
  if (this.players[this.currentPlayer]) {
    this.players[this.currentPlayer].dispose();
    delete this.players[this.currentPlayer];
  }

  var player = this.players[++this.currentPlayer];

  if (player) {
    player.setParentEventTarget(this);

    this.getHandler().listen(
        player,
        [mcore.players.EventType.NO_SUPPORT,
         mcore.players.EventType.NO_SUPPORTED_SRC],
        this.handleErrorEvent);

    if (this.wasDecorated()) {
      player.decorate(this.getElement());
    } else {
      player.render(this.getElement());
    }
  } else {
    this.dispatchEvent(mcore.players.EventType.NO_SUPPORT);
  }
};


/**
 * Return the player instance that is currently in the document.
 * @return {goog.ui.Component|undefined} A Component subclass.
 */
mcore.players.MultiPlayer.prototype.getCurrentPlayer = function() {
  return this.players[this.currentPlayer];
};


/**
 * Expose a copy of the players to preserve the preferred order.
 * @return {Array.<goog.ui.Component>} Player components.
 */
mcore.players.MultiPlayer.prototype.getPlayers = function() {
  return goog.array.clone(this.players);
};


/** @inheritDoc */
mcore.players.MultiPlayer.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  for (var i = 0; i < this.players.length; i++) {
    // The players array may now be sparse so we must check for defined values
    if (this.players[i]) {
      this.players[i].dispose();
    }
  }
  delete this.players;
};


goog.exportSymbol('mcore.MultiPlayer', mcore.players.MultiPlayer);
goog.exportSymbol('mcore.MultiPlayer.prototype.decorate',
    mcore.players.MultiPlayer.prototype.decorate);
goog.exportSymbol('mcore.MultiPlayer.prototype.render',
    mcore.players.MultiPlayer.prototype.render);
