type ItemList<T> = { length: number, item(i: number): T }

type Predicate<T> = { (value: T) : boolean }

/// Remove all occurrence of a given value from a given Array
export function removeValue(array: any[], value: any) {
    var i: number

    while (i = array.indexOf(value), i !== -1) {
        array.splice(i, 1)
    }
}

/// Extracts items from NodeList (et al) to an Array
export function toArray<T>(values: ItemList<T>) : Array<T> {
    var a: T[] = []
    
    for (var i=0; i<values.length; i++) {
        a.push(values.item(i))
    }
    
    return a
}

/// Returns true if at least one value in a given list of values matches a given predicate
export function some<T>(values: ItemList<T>, predicate: Predicate<T>): boolean {
    for (var i=0; i<values.length; i++) {
        if (predicate(values.item(i))) {
            return true
        }
    }
    
    return false
}
