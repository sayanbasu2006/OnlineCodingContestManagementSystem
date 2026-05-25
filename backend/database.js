const { initializeDatabase } = require('./src/config/db.ts');

if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

