const connection = require('../config/db');

const tagController = {
    // Thêm nhiều tag cùng lúc
    createTag: async (req, res) => {
        try {
            const { tags } = req.body; // Nhận mảng tags từ body

            // Kiểm tra dữ liệu đầu vào
            if (!tags || !Array.isArray(tags) || tags.length === 0) {
                return res.status(400).json({ message: 'Vui lòng cung cấp mảng tags hợp lệ' });
            }

            // Lấy kết nối database
            const db = await connection;

            // Chuẩn bị dữ liệu để insert (mảng các giá trị [name])
            const values = tags.map(name => [name]);

            // Thêm nhiều tag cùng lúc
            const insertQuery = 'INSERT INTO tags (name) VALUES ?';
            const [result] = await db.query(insertQuery, [values]);

            // Lấy danh sách tag_id vừa thêm (tính toán từ insertId)
            const insertedIds = Array.from(
                { length: result.affectedRows },
                (_, i) => result.insertId + i
            );

            return res.status(201).json({
                message: 'Thêm nhiều tag thành công',
                tags_added: tags.map((name, index) => ({
                    tag_id: insertedIds[index],
                    name
                })),
                total_added: result.affectedRows
            });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                // Xác định tag nào gây lỗi trùng
                const duplicateTag = err.sqlMessage.match(/'([^']+)'/)?.[1];
                return res.status(400).json({
                    message: `Tag '${duplicateTag}' đã tồn tại`,
                    error: err.message
                });
            }
            console.error('Lỗi trong createTag:', err);
            return res.status(500).json({
                message: 'Lỗi server',
                error: err.message || 'Lỗi không xác định'
            });
        }
    },

    // Lấy danh sách tất cả tag (giữ nguyên)
    getAllTags: async (req, res) => {
        try {
            const db = await connection;
            const selectQuery = 'SELECT * FROM Tags';
            const [rows] = await db.query(selectQuery);

            return res.json({
                message: 'Lấy danh sách tag thành công',
                tags: rows
            });
        } catch (err) {
            console.error('Lỗi trong getAllTags:', err);
            return res.status(500).json({
                message: 'Lỗi server',
                error: err.message || 'Lỗi không xác định'
            });
        }
    },
    // Thêm tag mới
    // createTag: async (req, res) => {
    //     try {
    //         const { name } = req.body;

    //         // Kiểm tra dữ liệu đầu vào
    //         if (!name) {
    //             return res.status(400).json({ message: 'Vui lòng cung cấp tên tag' });
    //         }

    //         // Lấy kết nối database
    //         const db = await connection;

    //         // Thêm tag
    //         const insertQuery = 'INSERT INTO tags (name) VALUES (?)';
    //         const [result] = await db.query(insertQuery, [name]);

    //         return res.status(201).json({
    //             message: 'Thêm tag thành công',
    //             tag_id: result.insertId,
    //             name
    //         });
    //     } catch (err) {
    //         if (err.code === 'ER_DUP_ENTRY') {
    //             return res.status(400).json({ message: 'Tag đã tồn tại' });
    //         }
    //         console.error('Lỗi trong createTag:', err);
    //         return res.status(500).json({
    //             message: 'Lỗi server',
    //             error: err.message || 'Lỗi không xác định'
    //         });
    //     }
    // },

    // // Lấy danh sách tất cả tag
    // getAllTags: async (req, res) => {
    //     try {
    //         // Lấy kết nối database
    //         const db = await connection;

    //         // Truy vấn tất cả tag
    //         const selectQuery = 'SELECT * FROM tags';
    //         const [rows] = await db.query(selectQuery);

    //         return res.json({
    //             message: 'Lấy danh sách tag thành công',
    //             tags: rows
    //         });
    //     } catch (err) {
    //         console.error('Lỗi trong getAllTags:', err);
    //         return res.status(500).json({
    //             message: 'Lỗi server',
    //             error: err.message || 'Lỗi không xác định'
    //         });
    //     }
    // },

    // Xóa tag theo tag_id
    deleteTag: async (req, res) => {
        try {
            const { tag_id } = req.params;

            // Kiểm tra dữ liệu đầu vào
            if (!tag_id) {
                return res.status(400).json({ message: 'Vui lòng cung cấp tag_id' });
            }

            // Lấy kết nối database
            const db = await connection;

            // Kiểm tra tag có tồn tại không
            const checkQuery = 'SELECT * FROM Tags WHERE tag_id = ?';
            const [rows] = await db.query(checkQuery, [tag_id]);

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Tag không tồn tại' });
            }

            // Xóa tag
            const deleteQuery = 'DELETE FROM tags WHERE tag_id = ?';
            await db.query(deleteQuery, [tag_id]);

            return res.json({ message: 'Xóa tag thành công' });
        } catch (err) {
            console.error('Lỗi trong deleteTag:', err);
            return res.status(500).json({
                message: 'Lỗi server',
                error: err.message || 'Lỗi không xác định'
            });
        }
    }
};

module.exports = tagController;