import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { AppText, Colors, Styles } from '../../../../constant';

export default class BudgetOutputText extends Component
{

    _formatAmount()
    {
        let n = Number(Number(this.props.amount.toString().replace(/[^0-9.-]+/g, ""))).toFixed(5);
        let x = new Intl.NumberFormat("en-us", { currency: "USD" }).format(n);
        return `$ ${x}`
    }

    render()
    {
        let amountStyles = [
            styles.budgetOutputText,
            styles.budgetOutputTextAmount1,
            { color: this.props.color }
        ];
        let labelStyles = [
            styles.budgetOutputText,
            (this.props.style ? styles.['budgetOutputTextLabel' + this.props.style] : styles.budgetOutputTextLabel1),
            { color: this.props.color }
        ];
        return (
            <View style={styles.containerStyle}>
                <Text
                    style={amountStyles}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    textBreakStrategy="simple">
                        {this._formatAmount()}
                </Text>
                <Text style={labelStyles}>{this.props.label}</Text>
            </View>
        )
    }
}

const height14 = Math.round(Dimensions.get('window').height * 0.01794);
const height36 = Math.round(Dimensions.get('window').height * 0.04615);
const height21 = Math.round(Dimensions.get('window').height * 0.02692);


const styles = StyleSheet.create({
    container: {
        marginTop: 3
    },
    budgetOutputText: {
        ...Platform.select({
            ios: {
            fontFamily: 'Roboto-Bold'
            },
            android: {
            fontFamily: 'Roboto-Bold'
            },
            default: {
            fontFamily: 'Arial'
            }
        }),
        fontSize: height14,
        textAlign: 'left',
        alignSelf: 'flex-start',
        marginTop: 5
    },
    budgetOutputTextAmount1: {
        fontSize: height36
    },
    budgetOutputTextLabel1: {
        fontSize: height21
    },
    budgetOutputTextLabel2: {
        fontSize: height14,
        width: '75%'
    }
});
