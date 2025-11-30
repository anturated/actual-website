{ pkgs ? import <nixpkgs> {config.permittedInsecurePackages = [ "openssl-1.1.1w" ];} }:

pkgs.mkShell {
  name = "Functions Api";

  buildInputs = [
    pkgs.dotnet-sdk_8
    pkgs.dotnet-sdk_9
    pkgs.dotnet-runtime_9
    pkgs.dotnet-runtime_8
    pkgs.omnisharp-roslyn

    pkgs.azure-cli
    pkgs.azure-functions-core-tools

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
