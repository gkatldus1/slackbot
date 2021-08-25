module.exports = (sequelize, DataTypes) => {
    return sequelize.define('eat_record', {
        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        food1: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        food2: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        food3: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
    }, {
        timestamps: true,
    });
};