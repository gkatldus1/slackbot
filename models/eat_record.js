module.exports = (sequelize, DataTypes) => {
    return sequelize.define('eat_record', {
        // id: {
        //     primaryKey: true,
        //     type: DataTypes.UUID,
        //     defaultValue: DataTypes.UUIDV4,
        //      allowNull: false,

        // },

        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: false,
        },
        food_list: {
            type: DataTypes.TEXT,
            allowNull: true,
            unique: false,
        },
    }, {
        timestamps: true,
    });
};