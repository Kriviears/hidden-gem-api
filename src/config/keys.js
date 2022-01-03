keys = {
  app: {
    name: 'Hidden Gems API',
    apiEndpoint: (process.env.API_URL) ? `/${process.env.API_URL}` : '/api',
  },
  database: {
    url: process.env.MONGODB_URI || `"mongodb+srv://moose:ondal00se@hgcluster.bhim4.mongodb.net/HGCluster?retryWrites=true&w=majority"`,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'jwt-secret',
    tokenLife: '7d',
  },
}

module.exports = keys;