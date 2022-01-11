"use strict";
module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "mongodb+srv://moose:ondal00se@hgcluster.bhim4.mongodb.net/hgcluster?authSource=admin&replicaSet=atlas-mx3kc1-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true",
};
