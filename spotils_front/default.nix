{ nodepkg, cookieDomain ? "localhost", serviceUrl ? "http://localhost:8000", ... }:
nodepkg.mkNodePackage {
    pname = "spotils-front";
    version = "1.0.0-rc.1";
    src = ./.;

    buildPhase = ''
        export COOKIE_DOMAIN=${cookieDomain}
        export SERVICE_URL=${serviceUrl}
        export REACT_APP_ENV=env
        npm run build
    '';
    installPhase = ''
        mkdir -p $out
        cp -Tr build $out
    '';
}