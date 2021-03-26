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

export default class List extends Component
{
    constructor(props)
    {
        super(props);
    }

    add()
    {
        const array = this.props.data;
        array.push({ label: '' })
        this.props.onUpdate(array);
    }

    update(index, value)
    {
        const array = this.props.data;
        array[index].label = value;
        this.props.onUpdate(array);
    }

    remove(index)
    {
        const array = this.props.data;
        array.splice(index, 1);
        this.props.onUpdate(array);
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
                    onAddItem={() => this.add()}
                    layout={6}
                />
                <View style={styles.content}>
                    {this.props.data.map((value, index) => (
                        <Swipeout
                            style={{backgroundColor: Colors.budget.background}}
                            right={[{ text: 'Delete', backgroundColor: 'red', onPress: () => this.remove(index)}]}
                            autoClose={true}
                            key={`${this.props.title}-${index}`}>
                                <View style={styles.row}>
                                    <FormInput
                                        updateMasterState={(id, nv) => this.update(index, nv)}
                                        value={value.label}
                                        textInputStyle={2}
                                        placeholder="Add Item"
                                        placeholderTextColor={Colors.plainGray3}
                                    />
                                </View>
                        </Swipeout>
                    ))}
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 26,
    display: 'flex',
    justifyContent: 'center'
  },
  row: {
    width: '100%',
    paddingTop: 26,
    paddingHorizontal: 28,
  }
});
