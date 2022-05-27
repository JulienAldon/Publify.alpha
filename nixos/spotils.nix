flake: { system, config, lib, pkgs, ... }:
let 
  cfg = config.services.spotils-back;
in { 
  options.services.spotils-back = {
    enable = lib.mkEnableOption "Spotify playlist managment tool";

    host = lib.mkOption { 
      type = lib.types.str;
      default = "0.0.0.0";
      description = "Host to bind to.";
    };

    port = lib.mkOption {
      type = lib.types.port;
      default = 8000;
      description = "Port to bind to.";
    };

    group = lib.mkOption {
      type = lib.types.str;
      default = "spotils";
      description = "Group under which the service runs.";
    };

    user = lib.mkOption {
      type = lib.types.str;
      default = "spotils";
      description = "User under which the service runs.";
    };

    corsOrigin = lib.mkOption {
      type = lib.types.str;
      description = "Allowed origin for Cross Origin Resource Sharing.";
    };

    envFile = lib.mkOption {
      type = lib.types.path;
      description = ''Path of the environment file containing:
        DATABASE_URL connection string for sqlalchemy,
        SPOTIFY_CLIENT_ID client ID delivered by Spotify developper dashboard,
        SPOTIFY_CLIENT_SECRET client SECRET delivered by Spotify developper dashboard.
      '';
    };
   
    uvicorn = {
      extraArguments = lib.mkOption {
        type = lib.types.separatedString " ";
        default = "";
        description = "Extra arguments passed to uvicorn.";
      };
      package = lib.mkOption {
        type = lib.types.package;
        default = pkgs.python39Packages.uvicorn;
        description = "The uvicorn package.";
      };
    };

    spotify = {
      callbackUrl = lib.mkOption {
        type = lib.types.singleLineStr;
        description = "URL Spotify redirects to after authentification.";
      };

      redirectUrl = lib.mkOption {
        type = lib.types.singleLineStr;
        description = "URL we redirect to after receiving a token.";
      };
    };

  };

  config = lib.mkIf cfg.enable {
    users.users = lib.optionalAttrs (cfg.user == "spotils") {
      spotils = {
        group = cfg.group;
        isSystemUser = true;
      };
    };

    users.groups = lib.optionalAttrs (cfg.group == "spotils") {
      spotils = {};
    };

    systemd.services.spotils = {
      description = "Spotify playlist managment tool";
      wantedBy = [ "multi-user.target" ];
      after = [ "network.target" ];
      environment = {
        APP_ENV = "env";
        CORS_ORIGIN = cfg.corsOrigin;
        CALLBACK_URL = cfg.spotify.callbackUrl;
        REDIRECT_URL = cfg.spotify.redirectUrl;
      };
      serviceConfig = {
        EnvironmentFile = cfg.envFile;
        User = cfg.user;
        Group = cfg.group;
        ExecStart = "${cfg.uvicorn.package}/bin/uvicorn --host ${cfg.host} --port ${cfg.port} --app-dir ${flake.packages.${system}.spotils-back} ${cfg.uvicorn.extraArguments} spotils_back:app";
      };
    };
  };
}
