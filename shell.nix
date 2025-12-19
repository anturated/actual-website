{ pkgs ? import <nixpkgs> {config.permittedInsecurePackages = [ "openssl-1.1.1w" ];} }:

pkgs.mkShell {
  name = "Functions Api";

  buildInputs = [
    pkgs.fish

    pkgs.nodejs
  
    pkgs.prisma-engines
    pkgs.prisma
    pkgs.openssl_1_1  # Prisma prefers this
  ];

  shellHook = ''
    export PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig"
    export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
    export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
    export PRISMA_QUERY_ENGINE_LIBRARY="${pkgs.prisma-engines}/lib/libquery_engine.node"
    export PRISMA_FMT_BINARY="${pkgs.prisma-engines}/bin/prisma-fmt"
  '';
}
