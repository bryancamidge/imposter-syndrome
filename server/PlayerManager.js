class PlayerManager {
  constructor() {
    this.players = new Map(); // socketId -> { id, name, isHost, connected, totalTime }
  }

  add(socketId, name, isHost) {
    const player = {
      id: socketId,
      name: name.trim().substring(0, 16),
      isHost,
      connected: true,
      totalTime: 0,
    };
    this.players.set(socketId, player);
    return player;
  }

  remove(socketId) {
    this.players.delete(socketId);
  }

  get(socketId) {
    return this.players.get(socketId);
  }

  getAll() {
    return Array.from(this.players.values()).filter(p => p.connected);
  }

  getAllIncludingDisconnected() {
    return Array.from(this.players.values());
  }

  count() {
    return this.getAll().length;
  }

  isHost(socketId) {
    const p = this.players.get(socketId);
    return p ? p.isHost : false;
  }

  hasName(name) {
    const trimmed = name.trim().toLowerCase();
    return this.getAll().some(p => p.name.toLowerCase() === trimmed);
  }

  pickRandomId() {
    const connected = this.getAll();
    return connected[Math.floor(Math.random() * connected.length)].id;
  }

  promoteNewHost() {
    const connected = this.getAll();
    if (connected.length === 0) return null;
    // Remove host from all first
    for (const p of this.players.values()) {
      p.isHost = false;
    }
    connected[0].isHost = true;
    return connected[0].id;
  }

  updateSocketId(oldId, newId) {
    const player = this.players.get(oldId);
    if (!player) return null;
    this.players.delete(oldId);
    player.id = newId;
    player.connected = true;
    this.players.set(newId, player);
    return player;
  }

  findDisconnectedByName(name) {
    const trimmed = name.trim().toLowerCase();
    for (const p of this.players.values()) {
      if (!p.connected && p.name.toLowerCase() === trimmed) return p;
    }
    return null;
  }

  markDisconnected(socketId) {
    const p = this.players.get(socketId);
    if (p) p.connected = false;
  }

  isDisconnected(socketId) {
    const p = this.players.get(socketId);
    return p ? !p.connected : true;
  }

  toClientArray() {
    return this.getAll().map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
    }));
  }

  getHostId() {
    for (const p of this.players.values()) {
      if (p.isHost && p.connected) return p.id;
    }
    return null;
  }
}

module.exports = PlayerManager;
