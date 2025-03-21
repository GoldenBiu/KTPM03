const connection = require('../config/db');

// 📌 Lấy danh sách hoạt động theo `destination_id`
const getact = async (req, res) => {
    const { destination_id } = req.params;

    try {
        const [activities] = await connection.query(
            "SELECT * FROM activities WHERE destination_id = ?",
            [destination_id]
        );

        if (activities.length === 0) {
            return res.status(404).json({ message: "Không có hoạt động nào cho điểm đến này." });
        }

        res.json({ destination_id, activities });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách hoạt động:", error);
        res.status(500).json({ error: "Lỗi máy chủ" });
    }
};
const addActivity = async (req, res) => {
    try {
        const { destination_id, name, details } = req.body;

        // Kiểm tra xem destination có tồn tại không
        const [destinationCheck] = await connection.query(
            "SELECT destination_id FROM destinations WHERE destination_id = ?",
            [destination_id]
        );

        if (destinationCheck.length === 0) {
            return res.status(404).json({ error: "Điểm đến không tồn tại!" });
        }

        // Thêm hoạt động vào database
        const [result] = await connection.query(
            "INSERT INTO activities (destination_id, name, details) VALUES (?, ?, ?)",
            [destination_id, name, details]
        );

        res.status(201).json({
            message: "Hoạt động đã được thêm thành công!",
            activity: {
                activity_id: result.insertId,
                destination_id,
                name,
                details
            }
        });
    } catch (error) {
        console.error("❌ Lỗi khi thêm hoạt động: ", error);
        res.status(500).json({ error: "Lỗi server!" });
    }
};


module.exports = { getact ,addActivity};

// export default  { getact }
