{ pkgs, nodepkg }:

nodepkg.mkNodePackage {
    pname = "spotils-front";
    version = "1.0.0-rc.1";
    src = ./.;

    buildPhase = ''
        npm run build
    '';
    installPhase = ''
        mkdir -p $out
        cp -Tr build $out
    '';
}