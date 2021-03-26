import React, { Component } from 'react';
import { 
    View, 
    Text, 
    StyleSheet
} from 'react-native';
import { AppText, Colors, Styles } from '../../../../constant';
import { TitleRow } from '../../../../component/titleRow';
import { LayoverInputMenu } from '../../../../component/layoverInputMenu';
import Swipeout from 'react-native-swipeout';
import { FormInput } from '../../../../component/formInput';

export default class Day extends Component
{
    constructor(props)
    {
        super(props);
        this.state = 
        {
            isLayoverOpen: false,
            layoverMenuMeal: ''
        }
    }

    add(nv)
    {
        switch(this.state.layoverMenuMeal)
        {
            case AppText.mealPage.breakfast:
                this.props.data.breakfast.push({ label: nv });
                break;
            case AppText.mealPage.snack:
                this.props.data.snack.push({ label: nv });
                break;
            case AppText.mealPage.lunch:
                this.props.data.lunch.push({ label: nv });
                break;
            case AppText.mealPage.dinner:
                this.props.data.dinner.push({ label: nv });
                break;
        }
        this.props.onUpdate(this.props.data);
        this.setState({ isLayoverOpen: false, layoverMenuMeal: '' });
    }

    update(array, index, value)
    {
        array[index].label = value;
        this.props.onUpdate(this.props.data);
    }

    remove(array, index)
    {
        array.splice(index, 1);
        this.props.onUpdate(this.props.data);
    }

    openMenu(meal)
    {
        this.setState({ isLayoverOpen: true, layoverMenuMeal: meal });
    }

    render()
    {
        return (
            <View style={{ marginBottom: this.props.last && 38 }}>
                <TitleRow
                    label={this.props.title}
                    layout={1}
                />
                <TitleRow
                    label={AppText.mealPage.breakfast}
                    onAddItem={() => this.openMenu(AppText.mealPage.breakfast)}
                    layout={5}
                />
                {this.props.data.breakfast.map((value, index) => (
                    <Swipeout
                        style={{backgroundColor: Colors.budget.background}}
                        right={[{ text: 'Delete', backgroundColor: 'red', onPress: () => this.remove(this.props.data.breakfast, index)}]}
                        autoClose={true}
                        key={`${this.props.title}-breakfast-${index}`}>
                            <View style={styles.row}>
                                <FormInput
                                    updateMasterState={(id, nv) => this.update(this.props.data.breakfast, index, nv)}
                                    value={value.label}
                                    textInputStyle={2}
                                    placeholder="Add Item"
                                    placeholderTextColor={Colors.plainGray3}
                                />
                            </View>
                    </Swipeout>
                ))}
                <TitleRow
                    label={AppText.mealPage.snack}
                    layout={5}
                    onAddItem={() => this.openMenu(AppText.mealPage.snack)}
                />
                {this.props.data.snack.map((value, index) => (
                    <Swipeout
                        style={{backgroundColor: Colors.budget.background}}
                        right={[{ text: 'Delete', backgroundColor: 'red', onPress: () => this.remove(this.props.data.snack, index)}]}
                        autoClose={true}
                        key={`${this.props.title}-breakfast-${index}`}>
                            <View style={styles.row}>
                                <FormInput
                                    updateMasterState={(id, nv) => this.update(this.props.data.snack, index, nv)}
                                    value={value.label}
                                    textInputStyle={2}
                                    placeholder="Add Item"
                                    placeholderTextColor={Colors.plainGray3}
                                />
                            </View>
                    </Swipeout>
                ))}
                <TitleRow
                    label={AppText.mealPage.lunch}
                    layout={5}
                    onAddItem={() => this.openMenu(AppText.mealPage.lunch)}
                />
                {this.props.data.lunch.map((value, index) => (
                    <Swipeout
                        style={{backgroundColor: Colors.budget.background}}
                        right={[{ text: 'Delete', backgroundColor: 'red', onPress: () => this.remove(this.props.data.lunch, index)}]}
                        autoClose={true}
                        key={`${this.props.title}-breakfast-${index}`}>
                            <View style={styles.row}>
                                <FormInput
                                    updateMasterState={(id, nv) => this.update(this.props.data.lunch, index, nv)}
                                    value={value.label}
                                    textInputStyle={2}
                                    placeholder="Add Item"
                                    placeholderTextColor={Colors.plainGray3}
                                />
                            </View>
                    </Swipeout>
                ))}
                <TitleRow
                    label={AppText.mealPage.dinner}
                    layout={5}
                    onAddItem={() => this.openMenu(AppText.mealPage.dinner)}
                />
                {this.props.data.dinner.map((value, index) => (
                    <Swipeout
                        style={{backgroundColor: Colors.budget.background }}
                        right={[{ text: 'Delete', backgroundColor: 'red', onPress: () => this.remove(this.props.data.dinner, index)}]}
                        autoClose={true}
                        key={`${this.props.title}-breakfast-${index}`}>
                            <View style={styles.row}>
                                <FormInput
                                    updateMasterState={(id, nv) => this.update(this.props.data.dinner, index, nv)}
                                    value={value.label}
                                    textInputStyle={2}
                                    placeholder="Add Item"
                                    placeholderTextColor={Colors.plainGray3}
                                />
                            </View>
                    </Swipeout>
                ))}
                {this.state.isLayoverOpen &&
                    <LayoverInputMenu
                        title={`${this.props.title} - ${this.state.layoverMenuMeal}`}
                        onClose={() => this.setState({ isLayoverOpen: false })}
                        onSubmit={nv => this.add(nv)}
                    />}
            </View>
        )
    }
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    display: 'flex',
    justifyContent: 'center'
  },
  row: {
    width: '100%',
    paddingHorizontal: 28,
    paddingBottom: 26
  },
});
