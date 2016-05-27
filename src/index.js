'use strict'

let _ = require('lodash');
let request = require('request');
let data = require('./data');

function getTransactions(cb, page = 1, transactions = []) {
  request(`http://resttest.bench.co/transactions/${page}.json`, (error, res, body) => {
    if (error || res.statusCode != 200) {
      cb(true, null); 
    }

    body = JSON.parse(body);
    transactions = transactions.concat(body.transactions);

    if (body.totalCount === _.size(transactions)) {
      cb(null, transactions); 
    } else {
      getTransactions(cb, page + 1, transactions);
    }
})};

function getTotalBalance(transactions) {
  return _(transactions).map(a => parseFloat(a.Amount)).sum();
}

function getTotalExpenses(transactions) {
  return _(transactions).map(a => parseFloat(a.Amount)).filter(a => a < 0).sum();
}

function getTotalPayments(transactions) {
  return _(transactions).map(a => parseFloat(a.Amount)).filter(a => a > 0).sum();
}

function getExpenseCategories(transactions) {
  var categories = {};

  _.forEach(transactions, (item) => {
    if (!categories[item.Ledger]) {
      categories[item.Ledger] = [];
    } 
    
    categories[item.Ledger].push(item);
  });
  
  return categories;
}

// Didn't do #1, but good candidate would be Google Maps API
function prettifyName(name) {
}

/*
getTransactions((error, result) => {
  if (!error) {
    console.log("Total Balance: $" + getTotalBalance(result));
    console.log("Total Expenses: $" + getTotalExpenses(result));
    console.log("Total Payments: $" + getTotalPayments(result));

    _.forEach(getExpenseCategories(result), (transactions, category) => {
      console.log("Category: " + category);
      _.forEach(transactions, (item) => {
        console.log("  " + item.Company);
      });
      console.log("Total: $" + getTotalBalance(transactions));
    });
  } else {
    console.log('Error fetching data.');
  }
});
*/
    console.log("Total Balance: $" + getTotalBalance(data));
    console.log("Total Expenses: $" + getTotalExpenses(data));
    console.log("Total Payments: $" + getTotalPayments(data));
    console.log("");
    console.log(data);
    _.forEach(getExpenseCategories(data), (transactions, category) => {
      console.log("Category: " + category);
      _.forEach(transactions, (item) => {
        console.log("  " + item.Company);
      });
      console.log("  Total: $" + getTotalExpenses(transactions));
    });
