class exercise extends React.Component {
    constructor(props) {
        this.state =  {
            repetitions: 3,
            completed: false,
            setup: {
                'Sitz' : 3,
                'Lehne' : 5
            }
        }

    }

    renderSetup() {
        let propertyname,
            setup = "";

        for (propertyname in this.props.setup) {
            setup += this.renderProperty(propertyname, this.props.setup[propertyname]);
        }

        return (
            <ul className="setup">
                {setup}
            </ul>
        );
    }

    renderProperty(name, value) {
        return <li>{name}: {value}</li>;
    }

    render() {
        return (
            <div className="exercise{this.state.completed ? ' completed' : ''}">
                <div class="row">
                    <img class="exerciseImage" src="this.props.exerciseImageUrl" />
                    <setup />
                </div>

            </div>
        );
    }
}

ReactDOM.render(
  <exercise setup={{'Sitz' : 3, 'Lehne' : 5}} exerciseImageUrl="test123" />,
  document.getElementById('root')
);