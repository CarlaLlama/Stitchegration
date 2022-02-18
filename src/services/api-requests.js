import fetch from 'node-fetch';

export default class APIRequestService {
  constructor(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
  
  async getAccounts(){
    const operationsDoc = `
      query GetAccounts {
        user {
          bankAccounts {
            name
          }
        }
      }
    `;
  
    let results = await this.fetchGraphQL(operationsDoc, 'GetAccounts', {});
    return results;
  }

  async getFirstAccountId() {
    let accounts = await this.getAccountIds();
    if (accounts && 
      accounts.data && 
      accounts.data.user && 
      accounts.data.user.bankAccounts && 
      accounts.data.user.bankAccounts[0] &&
      accounts.data.user.bankAccounts[0].id
      ) {
        return accounts.data.user.bankAccounts[0].id;
    }
    return false;
  }

  async getAccountIds(){
    const operationsDoc = `
      query GetAccounts {
        user {
          bankAccounts {
            name
            id
          }
        }
      }
    `;
  
    let results = await this.fetchGraphQL(operationsDoc, 'GetAccounts', {});
    return results;
  }

  async requestPayment(amount, currency){
    const operationsDoc = `
      mutation CreatePaymentRequest($amount: MoneyInput!, $payerReference: String!, $beneficiaryReference: String!, $externalReference: String, $beneficiaryName: String!, $beneficiaryBankId: BankBeneficiaryBankId!, $beneficiaryAccountNumber: String!) {
        clientPaymentInitiationRequestCreate(input: {amount: $amount, payerReference: $payerReference, beneficiaryReference: $beneficiaryReference, externalReference: $externalReference, beneficiary: {bankAccount: {name: $beneficiaryName, bankId: $beneficiaryBankId, accountNumber: $beneficiaryAccountNumber}}}) {
          paymentInitiationRequest {
            id
            url
          }
        }
      }
    `;

    const variables = {
      "amount": {
          "quantity": parseFloat(amount),
          "currency": currency
      },
      "payerReference": "YOUR_NAME",
      "beneficiaryReference": "YOUR_NAME",
      "beneficiaryName": "Fizz Buzz",
      "beneficiaryBankId": "absa",
      "beneficiaryAccountNumber": "41231231222",
      "externalReference": "example-e32e5478-325b-4869-a53e-2021727d2afe",
  }
  
    let results = await this.fetchGraphQL(operationsDoc, 'CreatePaymentRequest', variables);
    return results;
  }


  async requestUserConstrainedPayment(amount, currency, id){
    const operationsDoc = `
    mutation CreatePaymentRequest($amount: MoneyInput!, $payerReference: String!, $beneficiaryReference: String!, $beneficiaryName: String!, $beneficiaryBankId: BankBeneficiaryBankId!, $beneficiaryAccountNumber: String!, $payerBankAccountId: ID!) {
      userPaymentInitiationRequestCreate(input: {amount: $amount, payerReference: $payerReference, beneficiaryReference: $beneficiaryReference, beneficiary: {bankAccount: {name: $beneficiaryName, bankId: $beneficiaryBankId, accountNumber: $beneficiaryAccountNumber}}, payerConstraint: {bankAccount: {accountId: $payerBankAccountId}}}) {
        paymentInitiationRequest {
          id
          url
        }
      }
    }
    `;

    const variables = {
      "amount": {
          "quantity": parseFloat(amount),
          "currency": currency
      },
      "payerReference": "YOUR_NAME",
      "beneficiaryReference": "YOUR_NAME",
      "beneficiaryName": "Fizz Buzz",
      "beneficiaryBankId": "absa",
      "beneficiaryAccountNumber": "41231231222",
      "payerBankAccountId": id
  }
  
    let results = await this.fetchGraphQL(operationsDoc, 'CreatePaymentRequest', variables);
    return results;
  }


  async getPaymentStatus(id){
    const operationsDoc = `
    query GetPaymentRequestStatus($paymentRequestId: ID!) {
      node(id: $paymentRequestId) {
        ... on PaymentInitiationRequest {
          id
          url
          userReference
          state {
            __typename
            ... on PaymentInitiationRequestCompleted {
              date
              amount
              payer {
                ... on PaymentInitiationBankAccountPayer {
                  accountNumber
                  bankId
                }
              }
              beneficiary {
                ... on BankBeneficiary {
                  bankId
                }
              }
              proofOfPayment
            }
            ... on PaymentInitiationRequestCancelled {
              date
              reason
            }
            ... on PaymentInitiationRequestPending {
              __typename
              paymentInitiationRequest {
                id
              }
            }
          }
        }
      }
    }
    `;

    const variables = {
        "paymentRequestId": id
    };
  
    let results = await this.fetchGraphQL(operationsDoc, 'GetPaymentRequestStatus', variables);
    return results;
  }

  async fetchGraphQL(operationsDoc, operationName, variables) {
    const body = {
      query: operationsDoc,
      variables: variables,
      operationName: operationName
    };
    const response = await fetch('https://api.stitch.money/graphql', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`      
      },
      body: JSON.stringify(body)
    });
  
    const responseBody = await response.json();
    return responseBody;
  }
}