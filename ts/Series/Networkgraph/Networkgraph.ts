/* *
 *
 *  Networkgraph series
 *
 *  (c) 2010-2021 Paweł Fus
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import type AnimationOptions from '../../Core/Animation/AnimationOptions';
import type Chart from '../../Core/Chart/Chart';
import type NetworkgraphChart from './NetworkgraphChart';
import type NetworkgraphPointOptions from './NetworkgraphPointOptions';
import type NetworkgraphSeriesOptions from './NetworkgraphSeriesOptions';
import type { PointShortOptions } from '../../Core/Series/PointOptions';
import type { StatesOptionsKey } from '../../Core/Series/StatesOptions';
import type SVGAttributes from '../../Core/Renderer/SVG/SVGAttributes';
import type SVGElement from '../../Core/Renderer/SVG/SVGElement';
import type SVGPath from '../../Core/Renderer/SVG/SVGPath';

import GraphLayout from '../GraphLayoutComposition.js';
import H from '../../Core/Globals.js';
import NetworkgraphSeriesDefaults from './NetworkgraphSeriesDefaults.js';
import NodesComposition from '../NodesComposition.js';
import ReingoldFruchtermanLayout from './ReingoldFruchtermanLayout.js';
import SeriesRegistry from '../../Core/Series/SeriesRegistry.js';
const {
    series: Series,
    series: {
        prototype: {
            pointClass: Point
        }
    },
    seriesTypes
} = SeriesRegistry;
import U from '../../Core/Utilities.js';
const {
    addEvent,
    css,
    defined,
    extend,
    merge,
    pick
} = U;

import './DraggableNodes.js';

const dragNodesMixin = H.dragNodesMixin;

/* *
 *
 *  Declarations
 *
 * */

declare module '../../Core/Series/SeriesLike' {
    interface SeriesLike {
        layout?: ReingoldFruchtermanLayout;
    }
}

/* *
 *
 *  Class
 *
 * */

/**
 * @private
 * @class
 * @name Highcharts.seriesTypes.networkgraph
 *
 * @extends Highcharts.Series
 */
class NetworkgraphSeries extends Series implements Highcharts.DragNodesSeries, NodesComposition.SeriesComposition {

    /* *
     *
     *  Static Properties
     *
     * */

    public static defaultOptions = merge(
        Series.defaultOptions,
        NetworkgraphSeriesDefaults
    );

    /* *
     *
     *  Static Functions
     *
     * */

    public static compose = ReingoldFruchtermanLayout.compose;

    /* *
     *
     *  Properties
     *
     * */

    public data: Array<NetworkgraphPoint> = void 0 as any;

    public nodes: Array<NetworkgraphPoint> = void 0 as any;

    public options: NetworkgraphSeriesOptions = void 0 as any;

    public points: Array<NetworkgraphPoint> = void 0 as any;

}

/* *
 *
 *  Class Prototype
 *
 * */

interface NetworkgraphSeries {
    chart: NetworkgraphChart;
    createNode: NodesComposition.SeriesComposition['createNode'];
    data: Array<NetworkgraphPoint>;
    destroy(): void;
    directTouch: boolean;
    drawGraph?(): void;
    forces: Array<string>;
    hasDraggableNodes: boolean;
    isCartesian: boolean;
    layout: ReingoldFruchtermanLayout;
    nodeLookup: NodesComposition.SeriesComposition['nodeLookup'];
    nodes: Array<NetworkgraphPoint>;
    noSharedTooltip: boolean;
    onMouseDown: Highcharts.DragNodesMixin['onMouseDown'];
    onMouseMove: Highcharts.DragNodesMixin['onMouseMove'];
    onMouseUp: Highcharts.DragNodesMixin['onMouseUp'];
    pointArrayMap: Array<string>;
    pointClass: typeof NetworkgraphPoint;
    redrawHalo: Highcharts.DragNodesMixin['redrawHalo'];
    requireSorting: boolean;
    trackerGroups: Array<string>;
    deferLayout(): void;
    drawDataLabels(): void;
    generatePoints(): void;
    indexateNodes(): void;
    init(
        chart: Chart,
        options: NetworkgraphSeriesOptions
    ): NetworkgraphSeries;
    markerAttribs(
        point: NetworkgraphPoint,
        state?: StatesOptionsKey
    ): SVGAttributes;
    pointAttribs(
        point?: NetworkgraphPoint,
        state?: StatesOptionsKey
    ): SVGAttributes;
    render(): void;
    setState(state: StatesOptionsKey, inherit?: boolean): void;
    translate(): void;
}
extend(NetworkgraphSeries.prototype, {
    /**
     * Array of internal forces. Each force should be later defined in
     * integrations.js.
     * @private
     */
    forces: ['barycenter', 'repulsive', 'attractive'],
    hasDraggableNodes: true,
    drawGraph: void 0,
    isCartesian: false,
    requireSorting: false,
    directTouch: true,
    noSharedTooltip: true,
    pointArrayMap: ['from', 'to'],
    trackerGroups: ['group', 'markerGroup', 'dataLabelsGroup'],
    drawTracker: seriesTypes.column.prototype.drawTracker,
    // Animation is run in `series.simulation`.
    animate: void 0,
    buildKDTree: H.noop,
    /**
     * Create a single node that holds information on incoming and outgoing
     * links.
     * @private
     */
    createNode: NodesComposition.createNode,
    destroy: function (this: NetworkgraphSeries): void {
        if (this.layout) {
            this.layout.removeElementFromCollection(
                this,
                this.layout.series
            );
        }
        NodesComposition.destroy.call(this);
    },

    /* eslint-disable no-invalid-this, valid-jsdoc */

    /**
     * Extend init with base event, which should stop simulation during
     * update. After data is updated, `chart.render` resumes the simulation.
     * @private
     */
    init: function (
        this: NetworkgraphSeries
    ): NetworkgraphSeries {

        Series.prototype.init.apply(this, arguments as any);

        addEvent(this, 'updatedData', (): void => {
            if (this.layout) {
                this.layout.stop();
            }
        });

        addEvent(this, 'afterUpdate', (): void => {
            this.nodes.forEach((node): void => {
                if (node && node.series) {
                    node.resolveColor();
                }
            });
        });

        return this;
    },

    /**
     * Extend generatePoints by adding the nodes, which are Point objects
     * but pushed to the this.nodes array.
     * @private
     */
    generatePoints: function (this: NetworkgraphSeries): void {
        let node,
            i;

        NodesComposition.generatePoints.apply(this, arguments as any);

        // In networkgraph, it's fine to define stanalone nodes, create
        // them:
        if (this.options.nodes) {
            this.options.nodes.forEach(
                function (
                    nodeOptions: NodesComposition.PointCompositionOptions
                ): void {
                    if (!this.nodeLookup[nodeOptions.id as any]) {
                        this.nodeLookup[nodeOptions.id as any] =
                            this.createNode(nodeOptions.id as any);
                    }
                },
                this
            );
        }

        for (i = this.nodes.length - 1; i >= 0; i--) {
            node = this.nodes[i];

            node.degree = node.getDegree();
            node.radius = pick(
                node.marker && node.marker.radius,
                this.options.marker && this.options.marker.radius,
                0
            );

            // If node exists, but it's not available in nodeLookup,
            // then it's leftover from previous runs (e.g. setData)
            if (!this.nodeLookup[node.id]) {
                node.remove();
            }
        }


        this.data.forEach(function (link): void {
            link.formatPrefix = 'link';
        });

        this.indexateNodes();
    },

    /**
     * In networkgraph, series.points refers to links,
     * but series.nodes refers to actual points.
     * @private
     */
    getPointsCollection: function (
        this: NetworkgraphSeries
    ): Array<NetworkgraphPoint> {
        return this.nodes || [];
    },

    /**
     * Set index for each node. Required for proper `node.update()`.
     * Note that links are indexated out of the box in `generatePoints()`.
     *
     * @private
     */
    indexateNodes: function (this: NetworkgraphSeries): void {
        this.nodes.forEach(function (
            node: NetworkgraphPoint,
            index: number
        ): void {
            node.index = index;
        });
    },

    /**
     * Extend the default marker attribs by using a non-rounded X position,
     * otherwise the nodes will jump from pixel to pixel which looks a bit
     * jaggy when approaching equilibrium.
     * @private
     */
    markerAttribs: function (
        this: NetworkgraphSeries,
        point: NetworkgraphPoint,
        state?: StatesOptionsKey
    ): SVGAttributes {
        const attribs =
            Series.prototype.markerAttribs.call(this, point, state);

        // series.render() is called before initial positions are set:
        if (!defined(point.plotY)) {
            attribs.y = 0;
        }

        attribs.x = (point.plotX || 0) - (attribs.width || 0) / 2;

        return attribs;
    },
    /**
     * Run pre-translation and register nodes&links to the deffered layout.
     * @private
     */
    translate: function (this: NetworkgraphSeries): void {
        if (!this.processedXData) {
            this.processData();
        }
        this.generatePoints();

        this.deferLayout();

        this.nodes.forEach(function (node): void {
            // Draw the links from this node
            node.isInside = true;
            node.linksFrom.forEach(function (
                point: NetworkgraphPoint
            ): void {

                point.shapeType = 'path';

                // Pass test in drawPoints
                point.y = 1;
            });
        });
    },

    /**
     * Defer the layout.
     * Each series first registers all nodes and links, then layout
     * calculates all nodes positions and calls `series.render()` in every
     * simulation step.
     *
     * Note:
     * Animation is done through `requestAnimationFrame` directly, without
     * `Highcharts.animate()` use.
     * @private
     */
    deferLayout: function (this: NetworkgraphSeries): void {
        let layoutOptions = this.options.layoutAlgorithm,
            graphLayoutsStorage = this.chart.graphLayoutsStorage,
            graphLayoutsLookup = this.chart.graphLayoutsLookup,
            chartOptions = this.chart.options.chart,
            layout: ReingoldFruchtermanLayout;

        if (!this.visible) {
            return;
        }

        if (!graphLayoutsStorage) {
            this.chart.graphLayoutsStorage = graphLayoutsStorage = {};
            this.chart.graphLayoutsLookup = graphLayoutsLookup = [];
        }

        layout = graphLayoutsStorage[(layoutOptions as any).type];

        if (!layout) {
            (layoutOptions as any).enableSimulation =
                !defined(chartOptions.forExport) ?
                    (layoutOptions as any).enableSimulation :
                    !chartOptions.forExport;

            graphLayoutsStorage[(layoutOptions as any).type] = layout =
                new GraphLayout.layouts[(layoutOptions as any).type]();

            layout.init(layoutOptions as any);
            graphLayoutsLookup.splice(
                (layout as any).index,
                0,
                layout as any
            );
        }

        this.layout = layout;

        layout.setArea(0, 0, this.chart.plotWidth, this.chart.plotHeight);
        layout.addElementsToCollection([this], layout.series);
        layout.addElementsToCollection(this.nodes, layout.nodes);
        layout.addElementsToCollection(this.points, layout.links);
    },

    /**
     * Extend the render function to also render this.nodes together with
     * the points.
     * @private
     */
    render: function (this: NetworkgraphSeries): void {
        const series = this,
            points = series.points,
            hoverPoint = series.chart.hoverPoint,
            dataLabels = [] as Array<SVGElement>;

        // Render markers:
        series.points = series.nodes;
        seriesTypes.line.prototype.render.call(this);
        series.points = points;

        points.forEach(function (
            point: NetworkgraphPoint
        ): void {
            if (point.fromNode && point.toNode) {
                point.renderLink();
                point.redrawLink();
            }
        });

        if (hoverPoint && hoverPoint.series === series) {
            series.redrawHalo(hoverPoint);
        }

        if (series.chart.hasRendered &&
            !(series.options.dataLabels as any).allowOverlap
        ) {
            series.nodes.concat(series.points).forEach(function (node): void {
                if (node.dataLabel) {
                    dataLabels.push(node.dataLabel);
                }
            });
            series.chart.hideOverlappingLabels(dataLabels);
        }
    },

    // Networkgraph has two separate collecions of nodes and lines, render
    // dataLabels for both sets:
    drawDataLabels: function (this: NetworkgraphSeries): void {
        const textPath = (this.options.dataLabels as any).textPath;

        // Render node labels:
        Series.prototype.drawDataLabels.apply(this, arguments as any);

        // Render link labels:
        this.points = this.data;
        (this.options.dataLabels as any).textPath =
            (this.options.dataLabels as any).linkTextPath;
        Series.prototype.drawDataLabels.apply(this, arguments as any);

        // Restore nodes
        this.points = this.nodes;
        (this.options.dataLabels as any).textPath = textPath;
    },

    // Return the presentational attributes.
    pointAttribs: function (
        this: NetworkgraphSeries,
        point?: NetworkgraphPoint,
        state?: StatesOptionsKey
    ): SVGAttributes {
        // By default, only `selected` state is passed on
        let pointState = state || point && point.state || 'normal',
            attribs = Series.prototype.pointAttribs.call(
                this,
                point,
                pointState
            ),
            stateOptions = (this.options.states as any)[pointState];

        if (point && !point.isNode) {
            attribs = point.getLinkAttributes();
            // For link, get prefixed names:
            if (stateOptions) {
                attribs = {
                    // TO DO: API?
                    stroke: stateOptions.linkColor || attribs.stroke,
                    dashstyle: (
                        stateOptions.linkDashStyle || attribs.dashstyle
                    ),
                    opacity: pick(
                        stateOptions.linkOpacity, attribs.opacity
                    ),
                    'stroke-width': stateOptions.linkColor ||
                        attribs['stroke-width']
                };
            }
        }

        return attribs;
    },

    // Draggable mode:
    /**
     * Redraw halo on mousemove during the drag&drop action.
     * @private
     * @param {Highcharts.Point} point The point that should show halo.
     */
    redrawHalo: dragNodesMixin.redrawHalo,
    /**
     * Mouse down action, initializing drag&drop mode.
     * @private
     * @param {global.Event} event Browser event, before normalization.
     * @param {Highcharts.Point} point The point that event occured.
     */
    onMouseDown: dragNodesMixin.onMouseDown,
    /**
     * Mouse move action during drag&drop.
     * @private
     * @param {global.Event} event Browser event, before normalization.
     * @param {Highcharts.Point} point The point that event occured.
     */
    onMouseMove: dragNodesMixin.onMouseMove,
    /**
     * Mouse up action, finalizing drag&drop.
     * @private
     * @param {Highcharts.Point} point The point that event occured.
     */
    onMouseUp: dragNodesMixin.onMouseUp,
    /**
     * When state should be passed down to all points, concat nodes and
     * links and apply this state to all of them.
     * @private
     */
    setState: function (
        this: NetworkgraphSeries,
        state?: StatesOptionsKey,
        inherit?: boolean
    ): void {
        if (inherit) {
            this.points = this.nodes.concat(this.data);
            Series.prototype.setState.apply(this, arguments as any);
            this.points = this.data;
        } else {
            Series.prototype.setState.apply(this, arguments as any);
        }

        // If simulation is done, re-render points with new states:
        if (!this.layout.simulation && !state) {
            this.render();
        }
    }
});

/* *
 *
 *  Class
 *
 * */

class NetworkgraphPoint
    extends Point
    implements Highcharts.DragNodesPoint, NodesComposition.PointComposition {

    /* *
     *
     *  Properties
     *
     * */

    public degree: number = void 0 as any;

    public linksFrom: Array<NetworkgraphPoint> = void 0 as any;

    public linksTo: Array<NetworkgraphPoint> = void 0 as any;

    public options: NetworkgraphPointOptions = void 0 as any;

    public radius: number = void 0 as any;

    public series: NetworkgraphSeries = void 0 as any;

    public toNode: NetworkgraphPoint = void 0 as any;

}

/* *
 *
 *  Class Prototype
 *
 * */

interface NetworkgraphPoint {
    className: NodesComposition.PointComposition['className'];
    fixedPosition: Highcharts.DragNodesPoint['fixedPosition'];
    formatPrefix: NodesComposition.PointComposition['formatPrefix'];
    from: NodesComposition.PointComposition['from'];
    fromNode: NetworkgraphPoint;
    getSum: NodesComposition.PointComposition['getSum'];
    hasShape: NodesComposition.PointComposition['hasShape'];
    isNode: NodesComposition.PointComposition['isNode'];
    isValid: () => boolean;
    mass: NodesComposition.PointComposition['mass'];
    offset: NodesComposition.PointComposition['offset'];
    setNodeState: NodesComposition.PointComposition['setState'];
    to: NodesComposition.PointComposition['to'];
    destroy(): void;
    getDegree(): number;
    getLinkAttributes(): SVGAttributes;
    getLinkPath(): SVGPath;
    getMass(): Record<string, number>;
    getPointsCollection(): Array<NetworkgraphPoint>;
    init(
        series: NetworkgraphSeries,
        options: (NetworkgraphPointOptions|PointShortOptions),
        x?: number
    ): NetworkgraphPoint;
    redrawLink(): void;
    remove(redraw?: boolean, animation?: boolean): void;
    renderLink(): void;
}
extend(NetworkgraphPoint.prototype, {
    setState: NodesComposition.setNodeState,
    /**
     * Basic `point.init()` and additional styles applied when
     * `series.draggable` is enabled.
     * @private
     */
    init: function (
        this: NetworkgraphPoint
    ): NetworkgraphPoint {
        Point.prototype.init.apply(this, arguments as any);

        if (
            this.series.options.draggable &&
            !this.series.chart.styledMode
        ) {
            addEvent(this, 'mouseOver', function (): void {
                css(this.series.chart.container, { cursor: 'move' });
            });
            addEvent(this, 'mouseOut', function (): void {
                css(
                    this.series.chart.container, { cursor: 'default' }
                );
            });
        }

        return this;
    },
    /**
     * Return degree of a node. If node has no connections, it still has
     * deg=1.
     * @private
     */
    getDegree: function (this: NetworkgraphPoint): number {
        const deg = this.isNode ?
            this.linksFrom.length + this.linksTo.length :
            0;

        return deg === 0 ? 1 : deg;
    },
    // Links:
    /**
     * Get presentational attributes of link connecting two nodes.
     * @private
     */
    getLinkAttributes: function (
        this: NetworkgraphPoint
    ): SVGAttributes {
        const linkOptions = this.series.options.link,
            pointOptions = this.options;

        return {
            'stroke-width': pick(
                pointOptions.width,
                (linkOptions as any).width
            ),
            stroke: (
                pointOptions.color || (linkOptions as any).color
            ),
            dashstyle: (
                pointOptions.dashStyle || (linkOptions as any).dashStyle
            ),
            opacity: pick(
                pointOptions.opacity,
                (linkOptions as any).opacity,
                1
            )
        };
    },
    /**
     * Render link and add it to the DOM.
     * @private
     */
    renderLink: function (this: NetworkgraphPoint): void {
        let attribs: SVGAttributes;

        if (!this.graphic) {
            this.graphic = this.series.chart.renderer
                .path(
                    this.getLinkPath()
                )
                .addClass(this.getClassName(), true)
                .add(this.series.group);

            if (!this.series.chart.styledMode) {
                attribs = this.series.pointAttribs(this);
                this.graphic.attr(attribs);

                (this.dataLabels || []).forEach(function (
                    label: SVGElement
                ): void {
                    if (label) {
                        label.attr({
                            opacity: attribs.opacity
                        });
                    }
                });
            }
        }
    },
    /**
     * Redraw link's path.
     * @private
     */
    redrawLink: function (this: NetworkgraphPoint): void {
        let path = this.getLinkPath(),
            attribs: SVGAttributes;

        if (this.graphic) {
            this.shapeArgs = {
                d: path
            };

            if (!this.series.chart.styledMode) {
                attribs = this.series.pointAttribs(this);
                this.graphic.attr(attribs);

                (this.dataLabels || []).forEach(function (
                    label: SVGElement
                ): void {
                    if (label) {
                        label.attr({
                            opacity: attribs.opacity
                        });
                    }
                });
            }
            this.graphic.animate(this.shapeArgs);

            // Required for dataLabels
            const start = path[0];
            const end = path[1];
            if (start[0] === 'M' && end[0] === 'L') {
                this.plotX = (start[1] + end[1]) / 2;
                this.plotY = (start[2] + end[2]) / 2;
            }
        }
    },
    /**
     * Get mass fraction applied on two nodes connected to each other. By
     * default, when mass is equal to `1`, mass fraction for both nodes
     * equal to 0.5.
     * @private
     * @return {Highcharts.Dictionary<number>}
     *         For example `{ fromNode: 0.5, toNode: 0.5 }`
     */
    getMass: function (
        this: NetworkgraphPoint
    ): Record<string, number> {
        const m1 = this.fromNode.mass,
            m2 = this.toNode.mass,
            sum = m1 + m2;

        return {
            fromNode: 1 - m1 / sum,
            toNode: 1 - m2 / sum
        };
    },

    /**
     * Get link path connecting two nodes.
     * @private
     * @return {Array<Highcharts.SVGPathArray>}
     *         Path: `['M', x, y, 'L', x, y]`
     */
    getLinkPath: function (
        this: NetworkgraphPoint
    ): SVGPath {
        let left = this.fromNode,
            right = this.toNode;

        // Start always from left to the right node, to prevent rendering
        // labels upside down
        if ((left.plotX as any) > (right.plotX as any)) {
            left = this.toNode;
            right = this.fromNode;
        }

        return [
            ['M', left.plotX || 0, left.plotY || 0],
            ['L', right.plotX || 0, right.plotY || 0]
        ];
        /*
        IDEA: different link shapes?
        return [
            'M',
            from.plotX,
            from.plotY,
            'Q',
            (to.plotX + from.plotX) / 2,
            (to.plotY + from.plotY) / 2 + 15,
            to.plotX,
            to.plotY
        ];*/
    },

    isValid: function (this: NetworkgraphPoint): boolean {
        return !this.isNode || defined(this.id);
    },

    /**
     * Common method for removing points and nodes in networkgraph. To
     * remove `link`, use `series.data[index].remove()`. To remove `node`
     * with all connections, use `series.nodes[index].remove()`.
     * @private
     * @param {boolean} [redraw=true]
     *        Whether to redraw the chart or wait for an explicit call. When
     *        doing more operations on the chart, for example running
     *        `point.remove()` in a loop, it is best practice to set
     *        `redraw` to false and call `chart.redraw()` after.
     * @param {boolean|Partial<Highcharts.AnimationOptionsObject>} [animation=false]
     *        Whether to apply animation, and optionally animation
     *        configuration.
     */
    remove: function (
        this: NetworkgraphPoint,
        redraw?: boolean,
        animation?: boolean
    ): void {
        let point = this,
            series = point.series,
            nodesOptions = series.options.nodes || [],
            index: number,
            i = nodesOptions.length;

        // For nodes, remove all connected links:
        if (point.isNode) {
            // Temporary disable series.points array, because
            // Series.removePoint() modifies it
            series.points = [];

            // Remove link from all nodes collections:
            ([] as Array<NetworkgraphPoint>)
                .concat(point.linksFrom)
                .concat(point.linksTo)
                .forEach(
                    function (
                        linkFromTo: NetworkgraphPoint
                    ): void {
                        // Incoming links
                        index = linkFromTo.fromNode.linksFrom.indexOf(
                            linkFromTo
                        );
                        if (index > -1) {
                            linkFromTo.fromNode.linksFrom.splice(
                                index,
                                1
                            );
                        }

                        // Outcoming links
                        index = linkFromTo.toNode.linksTo.indexOf(
                            linkFromTo
                        );
                        if (index > -1) {
                            linkFromTo.toNode.linksTo.splice(
                                index,
                                1
                            );
                        }

                        // Remove link from data/points collections
                        Series.prototype.removePoint.call(
                            series,
                            series.data.indexOf(linkFromTo),
                            false,
                            false
                        );
                    }
                );

            // Restore points array, after links are removed
            series.points = series.data.slice();

            // Proceed with removing node. It's similar to
            // Series.removePoint() method, but doesn't modify other arrays
            series.nodes.splice(series.nodes.indexOf(point), 1);

            // Remove node options from config
            while (i--) {
                if (nodesOptions[i].id === point.options.id) {
                    (series.options.nodes as any).splice(i, 1);
                    break;
                }
            }

            if (point) {
                point.destroy();
            }

            // Run redraw if requested
            series.isDirty = true;
            series.isDirtyData = true;
            if (redraw) {
                series.chart.redraw(redraw);
            }
        } else {
            series.removePoint(
                series.data.indexOf(point),
                redraw,
                animation
            );
        }
    },

    /**
     * Destroy point. If it's a node, remove all links coming out of this
     * node. Then remove point from the layout.
     * @private
     */
    destroy: function (this: NetworkgraphPoint): void {
        if (this.isNode) {
            this.linksFrom.concat(this.linksTo).forEach(
                function (link: NetworkgraphPoint): void {
                    // Removing multiple nodes at the same time
                    // will try to remove link between nodes twice
                    if (link.destroyElements) {
                        link.destroyElements();
                    }
                }
            );
        }

        this.series.layout.removeElementFromCollection(
            this,
            (this.series.layout as any)[this.isNode ? 'nodes' : 'links']
        );

        return Point.prototype.destroy.apply(this, arguments as any);
    }
});

/* *
 *
 *  Registry
 *
 * */

declare module '../../Core/Series/SeriesType' {
    interface SeriesTypeRegistry {
        networkgraph: typeof NetworkgraphSeries;
    }
}
NetworkgraphSeries.prototype.pointClass = NetworkgraphPoint;
SeriesRegistry.registerSeriesType('networkgraph', NetworkgraphSeries);

/* *
 *
 *  Default Export
 *
 * */

export default NetworkgraphSeries;

/* *
 *
 *  API Declarations
 *
 * */

/**
 * Formatter callback function.
 *
 * @callback Highcharts.SeriesNetworkgraphDataLabelsFormatterCallbackFunction
 *
 * @param {Highcharts.SeriesNetworkgraphDataLabelsFormatterContextObject|Highcharts.PointLabelObject} this
 *        Data label context to format
 *
 * @return {string}
 *         Formatted data label text
 */

/**
 * Context for the formatter function.
 *
 * @interface Highcharts.SeriesNetworkgraphDataLabelsFormatterContextObject
 * @extends Highcharts.PointLabelObject
 * @since 7.0.0
 *//**
 * The color of the node.
 * @name Highcharts.SeriesNetworkgraphDataLabelsFormatterContextObject#color
 * @type {Highcharts.ColorString}
 * @since 7.0.0
 *//**
 * The point (node) object. The node name, if defined, is available through
 * `this.point.name`. Arrays: `this.point.linksFrom` and `this.point.linksTo`
 * contains all nodes connected to this point.
 * @name Highcharts.SeriesNetworkgraphDataLabelsFormatterContextObject#point
 * @type {Highcharts.Point}
 * @since 7.0.0
 *//**
 * The ID of the node.
 * @name Highcharts.SeriesNetworkgraphDataLabelsFormatterContextObject#key
 * @type {string}
 * @since 7.0.0
 */

''; // detach doclets above

/* *
 *
 *  API Options
 *
 * */

/**
 * A `networkgraph` series. If the [type](#series.networkgraph.type) option is
 * not specified, it is inherited from [chart.type](#chart.type).
 *
 * @extends   series,plotOptions.networkgraph
 * @excluding boostThreshold, animation, animationLimit, connectEnds,
 *            connectNulls, cropThreshold, dragDrop, getExtremesFromAll, label,
 *            linecap, negativeColor, pointInterval, pointIntervalUnit,
 *            pointPlacement, pointStart, softThreshold, stack, stacking,
 *            step, threshold, xAxis, yAxis, zoneAxis, dataSorting,
 *            boostBlending
 * @product   highcharts
 * @requires  modules/networkgraph
 * @apioption series.networkgraph
 */

/**
 * An array of data points for the series. For the `networkgraph` series type,
 * points can be given in the following way:
 *
 * An array of objects with named values. The following snippet shows only a
 * few settings, see the complete options set below. If the total number of
 * data points exceeds the series'
 * [turboThreshold](#series.area.turboThreshold), this option is not available.
 *
 *  ```js
 *     data: [{
 *         from: 'Category1',
 *         to: 'Category2'
 *     }, {
 *         from: 'Category1',
 *         to: 'Category3'
 *     }]
 *  ```
 *
 * @type      {Array<Object|Array|number>}
 * @extends   series.line.data
 * @excluding drilldown,marker,x,y,draDrop
 * @sample    {highcharts} highcharts/chart/reflow-true/
 *            Numerical values
 * @sample    {highcharts} highcharts/series/data-array-of-arrays/
 *            Arrays of numeric x and y
 * @sample    {highcharts} highcharts/series/data-array-of-arrays-datetime/
 *            Arrays of datetime x and y
 * @sample    {highcharts} highcharts/series/data-array-of-name-value/
 *            Arrays of point.name and y
 * @sample    {highcharts} highcharts/series/data-array-of-objects/
 *            Config objects
 * @product   highcharts
 * @apioption series.networkgraph.data
 */

/**
 * @type      {Highcharts.SeriesNetworkgraphDataLabelsOptionsObject|Array<Highcharts.SeriesNetworkgraphDataLabelsOptionsObject>}
 * @product   highcharts
 * @apioption series.networkgraph.data.dataLabels
 */

/**
 * The node that the link runs from.
 *
 * @type      {string}
 * @product   highcharts
 * @apioption series.networkgraph.data.from
 */

/**
 * The node that the link runs to.
 *
 * @type      {string}
 * @product   highcharts
 * @apioption series.networkgraph.data.to
 */

/**
 * A collection of options for the individual nodes. The nodes in a
 * networkgraph diagram are auto-generated instances of `Highcharts.Point`,
 * but options can be applied here and linked by the `id`.
 *
 * @sample highcharts/series-networkgraph/data-options/
 *         Networkgraph diagram with node options
 *
 * @type      {Array<*>}
 * @product   highcharts
 * @apioption series.networkgraph.nodes
 */

/**
 * The id of the auto-generated node, refering to the `from` or `to` setting of
 * the link.
 *
 * @type      {string}
 * @product   highcharts
 * @apioption series.networkgraph.nodes.id
 */

/**
 * The color of the auto generated node.
 *
 * @type      {Highcharts.ColorString}
 * @product   highcharts
 * @apioption series.networkgraph.nodes.color
 */

/**
 * The color index of the auto generated node, especially for use in styled
 * mode.
 *
 * @type      {number}
 * @product   highcharts
 * @apioption series.networkgraph.nodes.colorIndex
 */

/**
 * The name to display for the node in data labels and tooltips. Use this when
 * the name is different from the `id`. Where the id must be unique for each
 * node, this is not necessary for the name.
 *
 * @sample highcharts/series-networkgraph/data-options/
 *         Networkgraph diagram with node options
 *
 * @type      {string}
 * @product   highcharts
 * @apioption series.networkgraph.nodes.name
 */

/**
 * Mass of the node. By default, each node has mass equal to it's marker radius
 * . Mass is used to determine how two connected nodes should affect
 * each other:
 *
 * Attractive force is multiplied by the ratio of two connected
 * nodes; if a big node has weights twice as the small one, then the small one
 * will move towards the big one twice faster than the big one to the small one
 * .
 *
 * @sample highcharts/series-networkgraph/ragdoll/
 *         Mass determined by marker.radius
 *
 * @type      {number}
 * @product   highcharts
 * @apioption series.networkgraph.nodes.mass
 */

/**
 * Individual data label for each node. The options are the same as
 * the ones for [series.networkgraph.dataLabels](#series.networkgraph.dataLabels).
 *
 * @type      {Highcharts.SeriesNetworkgraphDataLabelsOptionsObject|Array<Highcharts.SeriesNetworkgraphDataLabelsOptionsObject>}
 *
 * @apioption series.networkgraph.nodes.dataLabels
 */

''; // adds doclets above to transpiled file
