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
        food1: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: false,
        },
        food2: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: false,
        },
        food3: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: false,
        },
    }, {
        timestamps: true,
    });
};