const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // No I or O (confusable with 1, 0)

function generateRoomCode(existingRooms) {
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
  } while (existingRooms.has(code));
  return code;
}

module.exports = { generateRoomCode };
