export const inputValue = (field, $event) => {
	let value;
	if (typeof field.tag === 'object') {
		if ('onInputCallback' in field && typeof field.onInputCallback === 'function') {
			value = field.onInputCallback($event);
		} else {
			throw new Error('onInputCallback is not defined or is not a valid function.');
		}
	} else if(field.props.type==='checkbox'){
    value = $event.target.checked?1:0;
  }
  else {
		value = $event.target.value
	}

	return value;
}
