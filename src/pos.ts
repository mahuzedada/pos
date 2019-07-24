const readline = require('readline');
const csv = require('csv-parser');
const fs = require('fs');
import {Product} from './model';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});


export class PosController {
    products: Array<Product> = [];
    cart: Array<Product> = [];
    subtotal = 0;
    totalTax = 0;
    totalStateTax = 0;
    totalCountyTax = 0;
    totalCityTax = 0;
    total = 0;
    amountPaidByCustomer = 0;
    customerChange = 0;
    constructor() { }
    start() {
        fs.createReadStream('./resources/products.csv')
            .pipe(csv())
            .on('data', (data: Product) => {
                this.products.push({...data, price: parseFloat(data.price.toString()), tax: this.getTax(data.price, data.category)});
            })
            .on('end', () => {
                console.log('POS is Ready!!');
                this.startTransaction();
            });
    }
    startTransaction() {
        this.cart = [];
        this.subtotal = 0;
        this.totalTax = 0;
        this.totalStateTax = 0;
        this.totalCountyTax = 0;
        this.totalCityTax = 0;
        this.total = 0;
        console.log('\n\n');
        console.log('=====================================');
        console.log('          New Transaction');
        console.log('=====================================');
        console.log('----Ringing Products----');
        this.takeProductInput();
    }
    processInput(input: string) {
        if (input === 'total') {
            this.runTotal();
        } else {
            this.processProductId(input);
        }
    }
    processProductId(productId: string) {
        const results = this.search(productId);
        switch (results.length) {
            case 0:
                console.log('Not found: ', productId);
                break;
            case 1:
                this.runProduct(results[0]);
                break;
            default:
                for(let product of results) {
                    console.log(product.id, ': ', product.name);
                }
                break;
        }
        this.takeProductInput();
    }
    search(productId: string) {
        return this.products.filter(product => {
            return product.id.startsWith(productId)
        });
    }
    runProduct(product: Product) {
        this.cart.push(product);
        console.log(product.name, '\t\t', product.price);
    }
    runTotal() {
        if (this.cart.length === 0) {
            this.takeProductInput();
            return;
        }
        console.log('\n\n');
        console.log('----Running Total----');
        this.subtotal = this.cart.reduce((accumulator, currentValue) => accumulator + currentValue.price, 0);
        this.totalTax = this.cart.reduce((accumulator, currentValue) => accumulator + currentValue.tax.total, 0);
        this.totalStateTax = this.cart.reduce((accumulator, currentValue) => accumulator + currentValue.tax.state, 0);
        this.totalCountyTax = this.cart.reduce((accumulator, currentValue) => accumulator + currentValue.tax.county, 0);
        this.totalCityTax = this.cart.reduce((accumulator, currentValue) => accumulator + currentValue.tax.city, 0);
        this.total = this.subtotal + this.totalTax;
        console.log('Subtotal:\t\t\t\t\t', this.subtotal);
        console.log('Tax:\t\t\t\t\t\t', this.totalTax);
        console.log('Total:\t\t\t\t\t\t', this.total);
        this.takeCustomerAmountPaidInput();
    }
    processCustomerAmountPaid(amount: number) {
        this.amountPaidByCustomer = amount;
        this.customerChange = amount - this.total;
        this.endTransaction();
    }
    endTransaction() {
        console.log('\n\n');
        console.log('----Receipt----');
        for (let product of this.cart) {
            console.log(product.id, ' ', product.name, ' (', product.category, ')\t\t\t', product.price);
        }
        console.log('\n');
        console.log('Subtotal:\t\t\t\t\t\t', this.subtotal);
        console.log('State Tax:\t\t\t\t\t\t', this.totalStateTax);
        console.log('County Tax:\t\t\t\t\t\t', this.totalCountyTax);
        console.log('City Tax:\t\t\t\t\t\t', this.totalCityTax);
        console.log('Total Tax:\t\t\t\t\t\t', this.totalTax);
        console.log('Total:\t\t\t\t\t\t\t', this.total);
        console.log('AmountPaid:\t\t\t\t\t\t', this.amountPaidByCustomer);
        console.log('Change Due:\t\t\t\t\t\t', this.customerChange);
        this.startTransaction();
    }
    getTax(price: number, category: string) {
        const stateTaxRate = .063;
        const countyTaxRate = .007;
        const cityTaxRate = .02;

        const stateTax = category === 'g' ? 0 : price * stateTaxRate;
        const countyTax = category === 'g' ? 0 : price * countyTaxRate;
        const cityTax = price * cityTaxRate;
        return {
            state: stateTax,
            county: countyTax,
            city: cityTax,
            total: stateTax + countyTax + cityTax
        };
    }
    takeProductInput() {
        rl.question('Product ID: ', (answer: string) => {
            this.processInput(answer);
        });
    }
    takeCustomerAmountPaidInput() {
        rl.question('Amount Paid: ', (answer: string) => {
            this.processCustomerAmountPaid(parseFloat(answer));
        });
    }
}
