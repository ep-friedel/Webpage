class exercise extends React.Component {
    constructor(props) {
        super();
        let i,
            pastResults = props.pastResults;

        this.state =  {
            repetitions: 3,
            completed: false,
            newResults: [],
            currentRep: {
                repetition: 1,
                reps: pastResults[pastResults.length - 1][0].reps,
                weight: pastResults[pastResults.length - 1][0].weight
            }
        }

        for (i = 0; i < this.state.repetitions; i++) {
            this.state.newResults.push({reps: undefined, weight: undefined});
        }
    }

    changedReps(newNumber) {
        let changedRep = Object.assign({}, this.state.currentRep, {reps: parseFloat(newNumber)});

        this.setState({
            currentRep: changedRep
        });
    }

    changedWeight(newNumber) {
        let changedRep = Object.assign({}, this.state.currentRep, {weight: parseFloat(newNumber)});

        this.setState({
            currentRep: changedRep
        });
    }

    enterResultsHandler() {
        let s = this.state,
            cRep = s.currentRep,
            rep = cRep.repetition,
            changedResult = s.newResults.slice();

        changedResult[rep - 1] = Object.assign({}, s.newResults[rep - 1], {reps: cRep.reps, weight: cRep.weight})

        if (s.repetitions > rep) {
            this.setState({
                newResults: changedResult,
                currentRep: Object.assign({}, cRep, {repetition: rep + 1, reps: this.props.pastResults[this.props.pastResults.length - 1][rep].reps, weight: this.props.pastResults[this.props.pastResults.length - 1][rep].weight})
            });
        } else {
            this.setState({
                newResults: changedResult,
                completed: true
            });
        }
    }

    render() {
        return React.createElement(
            'div',
            {className: "exercise" + (this.state.completed ? ' completed' : '')},
            React.createElement(
                'div',
                {className: "row"},
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'img',
                        {
                            className: 'exerciseImage',
                            src: this.props.details.imageUrl
                        }
                    )
                ),
                React.createElement(
                    details,
                    {details: this.props.details}
                )
            ),
            React.createElement(
                'div',
                null,
                React.createElement(
                    'h3',
                    null,
                    'Vergangene Trainingseinheiten',
                ),
                React.createElement(
                    'table',
                    {className: 'pastResults'},
                    React.createElement(
                        'tbody',
                        null,
                        React.createElement(
                            resultsRow,
                            {data: this.props.pastResults[this.props.pastResults.length - 1]}
                        ),
                        React.createElement(
                            resultsRow,
                            {data: this.props.pastResults[this.props.pastResults.length - 2]}
                        ),
                        React.createElement(
                            resultsRow,
                            {data: this.props.pastResults[this.props.pastResults.length - 3]}
                        )
                    )
                )
            ),
            React.createElement(
                'div',
                null,
                React.createElement(
                    'h3',
                    null,
                    'Heutige Trainingseinheit',
                ),
                React.createElement(
                    'table',
                    {className: 'newResults'},
                    React.createElement(
                        'tbody',
                        null,
                        React.createElement(
                            resultsRow,
                            {
                                data: this.state.newResults
                            }
                        )
                    )
                ),
                React.createElement(
                    enterResults,
                    {
                        currentReps: this.state.currentRep.reps,
                        currentWeight: this.state.currentRep.weight,
                        changedReps: (newNumber) => this.changedReps(newNumber),
                        changedWeight: (newNumber) => this.changedWeight(newNumber),
                        repetition: this.state.currentRep.repetition,
                        enterResults: () => this.enterResultsHandler(),
                        completed: this.state.completed
                    }
                ),
                React.createElement(
                    'button',
                    {className: (this.state.completed ? 'fullWidthButton' : 'hidden')},
                    'Nächste Übung wählen'
                )
            )
        );
    }
}


class details extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        let propertyname,
            setup = [];

        for (propertyname in this.props.details.setup) {
            setup.push(this.renderProperty(propertyname, this.props.details.setup[propertyname]));
        }

        return React.createElement(
            'div',
            null,
            React.createElement(
                'h4',
                null,
                (this.props.details.machine ? this.props.details.machine + ' - ' : '') + this.props.details.name
            ),
            React.createElement(
                'p',
                {className: 'note'},
                this.props.details.note
            ),
            React.createElement(
                'h4',
                null,
                'Einstellungen'
            ),
            React.createElement(
                'ul',
                {className: "setup"},
                setup
            )
        );
    }

    renderProperty(name, value) {
        return React.createElement(
            'li',
            {key: name},
            React.createElement(
                'span',
                null,
                name + ':'
            ),
            React.createElement(
                'span',
                null,
                value
            )
        );
    }
}

class resultsRow extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        let rep,
            cells = [];
        for (rep in this.props.data) {
            cells.push(this.renderCell(this.props.data[rep], rep));
        }

        return React.createElement(
            'tr',
            null,
            cells
        );
    }

    renderCell(data, id) {
        return React.createElement(
            'td',
            {key: id},
            React.createElement(
                'p',
                null,
                (data.reps !== undefined) ? data.reps + ' reps' : ''
            ),
            React.createElement(
                'p',
                null,
                (data.weight !== undefined) ? data.weight + 'kg' : ''
            )
        );
    }
}

class enterResults extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        let rep;

        return React.createElement(
            'div',
            {className: 'enterResults' + (this.props.completed ? ' hidden' : '')},
            React.createElement(
                'h3',
                null,
                this.props.repetition + '. Satz'
            ),
            React.createElement(
                'div',
                {className: 'row'},
                React.createElement(
                    repInput,
                    {
                        currentReps: this.props.currentReps,
                        currentRepsChanged: (newNumber) => this.props.changedReps(newNumber)
                    }
                ),
                React.createElement(
                    weightInput,
                    {
                        currentWeight: this.props.currentWeight,
                        currentWeightChanged: (newNumber) => this.props.changedWeight(newNumber)
                    }
                )
            ),
            React.createElement(
                'button',
                {className: 'submitResults fullWidthButton', onClick: this.props.enterResults},
                'Ergebnisse eintragen'
            )
        );
    }
}

class repInput extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        return React.createElement(
            'div',
            {className: 'repInput'},
            React.createElement(
                'h4',
                null,
                'Wiederholungen'
            ),
            React.createElement(
                'input',
                {
                    defaultValue: this.props.currentReps,
                    onChange: (evt) => this.props.currentRepsChanged(evt.target.value)
                }
            ),
        );
    }
}

class weightInput extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        return React.createElement(
            'div',
            {className: 'weightInput'},
            React.createElement(
                'h4',
                null,
                'Gewicht'
            ),
            React.createElement(
                'input',
                {
                    defaultValue: this.props.currentWeight,
                    onChange: (evt) => this.props.currentWeightChanged(evt.target.value)
                }
            ),
        );
    }
}


document.addEventListener("DOMContentLoaded", function(event) {
    ReactDOM.render(
        React.createElement(
            exercise,
            {
                details: {
                    imageUrl: "./images/situp.jpg",
                    machine: 'V18',
                    name: 'Butterfly',
                    note: 'Arme nach innen drücken',
                    setup: {
                        'Sitz' : 3,
                        'Lehne' : 5
                    }
                },
                pastResults: [
                    [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}],
                    [{reps: 16, weight: 15},{reps: 16, weight: 15},{reps: 16, weight: 15}],
                    [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}],
                    [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}]
                ]
            }
        ),
        document.getElementById('root')
    );
});