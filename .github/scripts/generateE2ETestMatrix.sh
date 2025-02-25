os_options=('ubuntu-latest' 'windows-latest')

ScriptsRoot="$( cd "$( dirname "${BASH_SOURCE[0]}" )"  && pwd )"
E2ETestConfigFile="$ScriptsRoot/../config/e2eTestConfig.json"
configs=$(jq -c '.[]' "${E2ETestConfigFile}")

matrix_json="{\"include\":["

for config in $configs; do
    rand_os=${os_options[$((RANDOM % 2))]}  # Random OS for each test
    configFile=$(echo "$config" | jq -r '.configFile')
    matrix_json+="{\"configFile\":\"$configFile\",\"os\":\"$rand_os\"},"
done

matrix_json="${matrix_json::-1}]}"  # Remove trailing comma

echo "Generated Matrix: $matrix_json"
echo "::set-output name=matrix::$matrix_json"  # Set matrix output