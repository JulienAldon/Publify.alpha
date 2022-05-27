{ nodepkg, cookieDomain, serviceUrl }:
nodepkg.mkNodePackage {
    pname = "spotils-front";
    version = "1.0.0-rc.1";
    src = ./.;

    buildPhase = ''
        export COOKIE_DOMAIN=${cookieDomain}
        export SERVICE_URL=${serviceUrl}
        npm run build
    '';
    installPhase = ''
        mkdir -p $out
        cp -Tr build $out
    '';
}