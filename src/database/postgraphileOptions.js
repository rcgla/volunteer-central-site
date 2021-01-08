import PgSimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector";
import PgFilterPlugin from "postgraphile-plugin-connection-filter";
import PgOrderByPlugin from "@graphile-contrib/pg-order-by-related";
import PgManyToMany from "@graphile-contrib/pg-many-to-many";
const options = {
    dynamicJson: true,
    //cors: true,
    //graphiql: false,
    //graphqlRoute: '/graphql',
    //externalUrlBase: ``,
    pgDefaultRole: process.env.DB_DEFAULT_ROLE || 'rcglavc_public_role',
    // If consuming JWT:
    jwtSecret: process.env.JWT_SECRET,
    // If generating JWT:
    jwtPgTypeIdentifier: process.env.JWT_PG_TYPE_IDENTIFIER || 'rcglavc.jwt_token',
    ignoreRBAC: false,
    appendPlugins: [PgSimplifyInflectorPlugin, PgFilterPlugin, PgOrderByPlugin, PgManyToMany],
    simpleCollections: "both",
    graphileBuildOptions: {pgOmitListSuffix: true}
};

export { options };