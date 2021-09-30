# Load-Testing


# Azure Service Principal for RBAC

For using any credentials like Azure Service Principal in your workflow, add them as secrets in the GitHub Repository and then refer them in the workflow.

Run Azure CLI command to create an Azure Service Principal for RBAC:
    az ad sp create-for-rbac --name "myApp" --role contributor \
                             --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
                             --sdk-auth
    
    Replace {subscription-id}, {resource-group} with the subscription, resource group 
    The command should output a JSON object similar to this:

  {
    "clientId": "<GUID>",
    "clientSecret": "<GUID>",
    "subscriptionId": "<GUID>",
    "tenantId": "<GUID>",
    (...)
  }
You can further scope down the Azure Credentials using scope attribute. For example,
 az ad sp create-for-rbac --name "myApp" --role contributor \
                          --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.Web/sites/{app-name} \
                          --sdk-auth

# Replace {subscription-id}, {resource-group}, and {app-name} with the names of your subscription, resource group, and Azure Web App.
Paste the json response from above Azure CLI to your GitHub Repository > Settings > Secrets > Add a new secret > AZURE_CREDENTIALS

- name: load-testing
  uses: azure/load-testing@v1
  with:
    azuresubscription: ${{ secrets.AZURE_CREDENTIALS }}
    YAMLFilePath: loadTest.yaml 
    loadtestresource: 'cloudtestres'
    resourcegroup: 'requestworkerdev'



## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
