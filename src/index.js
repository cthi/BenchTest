'use strict'

let _ = require('lodash');
let request = require('request');

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

// Didn't do #1, but good candidate would be Google Maps API
function prettifyName(name) {
}

function dedupe(transactions) {
  let uniq = [];
  let dupes = []; 

  _.forEach(transactions, (item) => {
    if (!_.find(uniq, u => _.isEqual(u, item))){
      uniq.push(item);
    } else {
      dupes.push(item);
    }
  });  

  return [uniq, dupes];
}

function getExpenseCategories(transactions) {
  let categories = {};

  _.forEach(transactions, (item) => {
    if (!categories[item.Ledger]) {
      categories[item.Ledger] = [];
    } 
    
    categories[item.Ledger].push(item);
  });
  
  return categories;
}

function getDailyBalances(transactions) {
  let dates = {};
  let total = 0;

  _.forEach(transactions, (item) => {
    if (!dates[item.Date]) {
      dates[item.Date] = 0;
    }
    dates[item.Date] += parseFloat(item.Amount);
  });
  
  dates = 
    _(dates)
    .map((val, key) => ({date : key, balance : val }))
    .sortBy(date => date.date)
    .map(date => {
      total += date.balance;
      return {date : date.date, balance : total };
    }).value();
  
  return dates;
}

getTransactions((error, result) => {
  if (!error) {
    console.log(`Total Balance: $${getTotalBalance(result).toFixed(2)}`);
    console.log(`Total Expenses: $${getTotalExpenses(result).toFixed(2)}`);
    console.log(`Total Payments: $${getTotalPayments(result).toFixed(2)}`);
    console.log("");

    _.forEach(getExpenseCategories(result), (transactions, category) => {
      console.log(`Category: ${category}`);
      _.forEach(transactions, (item) => {
        console.log("  " + item.Company);
      });
      console.log(`Total: $${getTotalBalance(transactions).toFixed(2)}`);
      console.log("");
    });
    console.log("");

    var [uniq, dupes] = dedupe(data);
    console.log(`Found ${_.size(dupes)} duplicates`)
    console.log("");
    _.forEach(dupes, (item) => {
      console.log(`Date: ${item.Date}`);
      console.log(`Ledger: ${item.Ledger}`);
      console.log(`Amount: $${item.Amount}`);
      console.log(`Company: ${item.Company}`);
      console.log("");
    });
    
    console.log("Daily Balance");
    _.forEach(getDailyBalances(result), (date) => {
      console.log(`${date.date} - $${date.balance.toFixed(2)}`);
    });
  } else {
    console.log('Error fetching data.');
  }
});
