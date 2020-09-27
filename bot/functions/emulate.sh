export GOOGLE_APPLICATION_CREDENTIALS="./service-account/service_account.json"

# firebase functions:config:get >.runtimeconfig.json
# cp test-config.json .runtimeconfig.json
# firebase functions:config:get > .runtimeconfig.json
firebase emulators:start
