{ pkgs, ... }:

pkgs.python39Packages.buildPythonPackage {
  pname = "spotils-back";
  src = ./.;
  version = "1.0.0-rc.1";
  propagatedBuildInputs = [ 
      pkgs.python39Packages.fastapi
      pkgs.python39Packages.requests
      pkgs.python39Packages.spotipy
      pkgs.python39Packages.sqlalchemy
      pkgs.python39Packages.psycopg2
    ];
}
