import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  port: process.env.MYSQL_PORT,
  connectionLimit: 30,
  timezone: "Z",
});

export const query = async (sql, values) => {
  console.info(
    `${mysql
      .format(sql, values)
      .replace(/\r?\n|\r/g, "")
      .replace(/\s+/g, " ")}`
  );
  try {
    const rows = await pool.query(sql, values);
    return rows[0];
  } catch (error) {
    console.error("db query error:", error);
    throw error;
  }
};

export const selectVideoIdByFilename = async (stored_filename) => {
  const sql = `SELECT video_id FROM videos WHERE stored_filename = ?`;
  const result = await query(sql, [stored_filename]);
  return result[0].video_id;
};

export const deleteVideoById = async (video_id) => {
  const sql = `DELETE FROM videos WHERE video_id = ?`;
  await query(sql, [video_id]);
};

export const insertOriginalVideo = async (
  original_filename,
  stored_filename
) => {
  const sql = `INSERT INTO videos (original_filename, stored_filename) VALUES (?, ?)`;
  const queryResult = await query(sql, [original_filename, stored_filename]);
  return queryResult.insertId;
};

export const insertSplitVideo = async (video_id, split_number, file_path) => {
  const sql = `INSERT INTO video_splitted (video_id, split_number, file_path) VALUES (?, ?, ?)`;
  await query(sql, [video_id, split_number, file_path]);
};

export const selectVideoById = async (videoId) => {
  const sql = `SELECT * FROM videos WHERE video_id = ?`;
  const queryResult = await query(sql, [videoId]);
  return queryResult;
};

export const selectSplitVideos = async ({
  videoId,
  minSplitId,
  maxSplitId,
}) => {
  let sql = `SELECT video_splitted_id, file_path FROM video_splitted WHERE video_id = ?`;
  let paramArray = [videoId];
  if (minSplitId) {
    sql += ` AND split_number >= ?`;
    paramArray.push(minSplitId);
  }
  if (maxSplitId) {
    sql += ` AND split_number <= ?`;
    paramArray.push(maxSplitId);
  }
  const queryResult = await query(sql, paramArray);
  return queryResult;
};
