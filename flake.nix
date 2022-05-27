{ 
  description = "Spotify playlist managment tool";
  inputs = {
    nixpkgs.url = "nixpkgs";
    utils.url = "github:numtide/flake-utils";
    nodepkgs.url = "github:winston0410/mkNodePackage";
  };

  outputs = { self, nixpkgs, utils, nodepkgs }: 
  let 
    pkgs = nixpkgs.legacyPackages.x86_64-linux;
    nodepkg = nodepkgs.lib.x86_64-linux;
  in {
    packages.x86_64-linux = utils.lib.flattenTree {
      spotils-back = nixpkgs.lib.callPackageWith pkgs ./spotils_back {};
      spotils-front = nixpkgs.lib.callPackageWith pkgs ./spotils_front { inherit nodepkg; };
    };
    nixosModule = import ./nixos/spotils.nix self;
  };
}