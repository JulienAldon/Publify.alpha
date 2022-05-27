{ nodepkg, cookieDomain, serviceUri }:
nodepkg.mkNodePackage {
    pname = "spotils-front";
    version = "1.0.0-rc.1";
    src = ./.;

    buildPhase = ''
        export COOKIE_DOMAIN=${cookieDomain}
        export SERVICE_URI=${serviceUri}
        npm run build
    '';
    installPhase = ''
        mkdir -p $out
        cp -Tr build $out
    '';
}