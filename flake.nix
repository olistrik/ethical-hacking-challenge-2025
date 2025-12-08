{
  description = "Hello world flake using uv2nix";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { nixpkgs, ... }:
    let
      # This example is only using x86_64-linux
      pkgs = nixpkgs.legacyPackages.x86_64-linux;
    in
    {
      devShells.x86_64-linux = {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs
            bun
          ];

          DATABASE_URL = "postgres://admin:secure_password@localhost:5432/myapp";
        };
      };
    };
}

